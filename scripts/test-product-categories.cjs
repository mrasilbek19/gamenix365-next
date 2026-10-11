const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(relative) {
    const filename = path.resolve(root, relative);
    if (cache.has(filename)) return cache.get(filename);
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const module = { exports: {} };
    const localRequire = name => name.startsWith('.')
        ? load(path.relative(root, path.resolve(path.dirname(filename), `${name}.ts`))) : require(name);
    vm.runInThisContext(`(function(require, module, exports) {${source}\n})`, { filename })(localRequire, module, module.exports);
    cache.set(filename, module.exports);
    return module.exports;
}
const { ProductType } = load('libs/enums/product.enum.ts');
const { PRODUCT_GROUPS, PRODUCT_TYPE_LABELS, getProductGroup, normalizeCatalogInput, selectProductTypes } = load('libs/productCategories.ts');
const groups = [
    ['PC', ['KEYBOARD', 'MONITOR', 'MOUSE', 'HEADPHONES', 'ACCESSORY']],
    ['Mobile', ['GAMING_PHONE']], ['Console', ['PLAYSTATION', 'CONTROLLER']],
    ['PC Components', ['CPU', 'GPU', 'RAM']], ['Furniture', ['CHAIR', 'DESK']],
];
assert.deepEqual(PRODUCT_GROUPS.map(group => [group.label, group.types]), groups);
const everyType = PRODUCT_GROUPS.flatMap(group => group.types);
assert.deepEqual([...everyType].sort(), Object.values(ProductType).sort());
assert.equal(new Set(everyType).size, everyType.length);
const initial = { page: 4, limit: 9, sort: 'productPrice', direction: 'ASC', search: {
    text: 'gaming', memberId: 'shop-id', pricesRange: { start: 50, end: 500 }, periodsRange: { start: '2026-01-01', end: '2026-12-31' },
} };
assert.deepEqual(normalizeCatalogInput(initial).search.typeList, PRODUCT_GROUPS[0].types);
for (const group of PRODUCT_GROUPS) {
    const result = selectProductTypes(initial, group.types);
    assert.equal(result.page, 1);
    assert.deepEqual({ ...result, page: initial.page, search: { ...result.search, typeList: undefined } },
        { ...initial, search: { ...initial.search, typeList: undefined } });
    assert.equal(getProductGroup(group.types).id, group.id);
    for (const type of group.types) {
        assert.equal(getProductGroup([type]).id, group.id);
        assert.ok(PRODUCT_TYPE_LABELS[type]);
        const selected = selectProductTypes(result, [type]);
        assert.deepEqual(selected.search.typeList, [type]);
        assert.deepEqual(normalizeCatalogInput(JSON.parse(JSON.stringify(selected))), selected);
    }
}
const legacy = { ...initial, search: { ...initial.search, typeList: ['KEYBOARD', 'CHAIR'] } };
assert.deepEqual(normalizeCatalogInput(legacy), legacy);
assert.equal(getProductGroup(legacy.search.typeList), undefined);
assert.deepEqual(normalizeCatalogInput(selectProductTypes(initial, [])).search.typeList, []);
assert.deepEqual(normalizeCatalogInput({ ...initial, search: { typeList: ['CPU', 'INVALID'] } }).search.typeList, ['CPU']);
assert.equal(initial.page, 4);
assert.equal(initial.search.typeList, undefined);
console.log('PASS: all five groups, 13 product types, defaults, filter preservation, page resets, URL round trips, legacy links and all-products view');
