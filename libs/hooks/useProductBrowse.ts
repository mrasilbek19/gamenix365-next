import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { ProductsInquiry } from '../types/product/product';
import { PRODUCT_GROUPS, ProductCategorySelection, categorySelectionFromTypes, categorySelectionTypes, normalizeCatalogInput } from '../productCategories';
import { ProductType } from '../enums/product.enum';
import { Direction } from '../enums/common.enum';

const CATEGORY_NAMES: Record<string, string> = { pc: 'PC', mobile: 'MOBILE', console: 'CONSOLE', components: 'PC_COMPONENTS', furniture: 'FURNITURE' };
const FILTER_KEYS = ['input', 'category', 'subcategory', 'q', 'minPrice', 'maxPrice', 'sort', 'direction', 'page', 'limit', 'shop', 'from', 'to'];
const valueOf = (value: string | string[] | undefined) => Array.isArray(value) ? value.join(',') : value;
const positiveNumber = (value: string | undefined, fallback: number) => {
    const number = Number(value);
    return value && Number.isInteger(number) && number > 0 ? number : fallback;
};

export function readProductUrl(query: ParsedUrlQuery, initial: ProductsInquiry) {
    const hasFilters = FILTER_KEYS.some(key => key !== 'input' && query[key] !== undefined);
    let input = normalizeCatalogInput(initial);
    if (!hasFilters && typeof query.input === 'string') {
        try {
            const legacy = JSON.parse(query.input);
            const { memberId, pricesRange, text, periodsRange, typeList } = legacy.search ?? {};
            input = normalizeCatalogInput({
                page: positiveNumber(String(legacy.page ?? ''), 1), limit: positiveNumber(String(legacy.limit ?? ''), initial.limit),
                sort: ['createdAt', 'updatedAt', 'productPrice', 'productLikes', 'productViews', 'productRank'].includes(legacy.sort) ? legacy.sort : 'createdAt',
                direction: legacy.direction === Direction.ASC ? Direction.ASC : Direction.DESC,
                search: { ...(memberId ? { memberId } : {}), ...(pricesRange ? { pricesRange } : {}),
                    ...(text ? { text } : {}), ...(periodsRange ? { periodsRange } : {}),
                    ...(Array.isArray(typeList) ? { typeList } : {}) },
            });
        } catch { /* Invalid legacy links use the existing catalog defaults. */ }
    }
    if (!hasFilters) return { input, selection: categorySelectionFromTypes(input.search.typeList) };
    const requested = (valueOf(query.category) ?? '').split(',');
    let categories = PRODUCT_GROUPS.filter(group => requested.includes(CATEGORY_NAMES[group.id]) || requested.includes(group.id)).map(group => group.id);
    const requestedTypes = (valueOf(query.subcategory) ?? '').split(',');
    let subcategories = Object.values(ProductType).filter(type => requestedTypes.includes(type));
    if (query.category === undefined) {
        categories = subcategories.length ? categorySelectionFromTypes(subcategories).categories : categorySelectionFromTypes(input.search.typeList).categories;
    }
    subcategories = subcategories.filter(type => PRODUCT_GROUPS.some(group => categories.includes(group.id) && group.types.includes(type)));
    const selection = { categories, subcategories };
    const sortName = valueOf(query.sort) ?? 'new';
    const sort = sortName === 'lowest' || sortName === 'highest' ? 'productPrice'
        : ['updatedAt', 'productPrice', 'productLikes', 'productViews', 'productRank'].includes(sortName) ? sortName : 'createdAt';
    const direction = sortName === 'lowest' ? Direction.ASC : sortName === 'highest' ? Direction.DESC
        : query.direction === Direction.ASC ? Direction.ASC : Direction.DESC;
    const numberValue = (key: string, fallback: number) => {
        const raw = valueOf(query[key]);
        const number = Number(raw);
        return raw && Number.isFinite(number) && number >= 0 ? number : fallback;
    };
    const pricesRange = { start: numberValue('minPrice', initial.search.pricesRange?.start ?? 0),
        end: numberValue('maxPrice', initial.search.pricesRange?.end ?? 2000000) };
    const shop = valueOf(query.shop);
    const from = valueOf(query.from);
    const to = valueOf(query.to);
    return { selection, input: { page: positiveNumber(valueOf(query.page), 1), limit: positiveNumber(valueOf(query.limit), initial.limit),
        sort, direction, search: { typeList: categorySelectionTypes(selection), text: valueOf(query.q) ?? '',
            pricesRange: pricesRange.start <= pricesRange.end ? pricesRange : initial.search.pricesRange,
            ...(shop ? { memberId: shop } : {}), ...(from && to ? { periodsRange: { start: from, end: to } } : {}) } } as ProductsInquiry };
}

export function productUrlQuery(query: ParsedUrlQuery, input: ProductsInquiry, selection: ProductCategorySelection, initial: ProductsInquiry) {
    const result: ParsedUrlQuery = { ...query };
    FILTER_KEYS.forEach(key => delete result[key]);
    result.category = PRODUCT_GROUPS.filter(group => selection.categories.includes(group.id)).map(group => CATEGORY_NAMES[group.id]).join(',') || 'ALL';
    if (selection.subcategories.length) result.subcategory = selection.subcategories.join(',');
    if (input.search.text) result.q = input.search.text;
    if (input.page > 1) result.page = String(input.page);
    if (input.limit !== initial.limit) result.limit = String(input.limit);
    if (input.sort === 'productPrice') result.sort = input.direction === Direction.ASC ? 'lowest' : 'highest';
    else if (input.sort && input.sort !== 'createdAt') result.sort = input.sort;
    if (input.sort !== 'productPrice' && input.direction === Direction.ASC) result.direction = Direction.ASC;
    if (input.search.pricesRange) {
        if (input.search.pricesRange.start !== (initial.search.pricesRange?.start ?? 0)) result.minPrice = String(input.search.pricesRange.start);
        if (input.search.pricesRange.end !== (initial.search.pricesRange?.end ?? 2000000)) result.maxPrice = String(input.search.pricesRange.end);
    }
    if (input.search.memberId) result.shop = input.search.memberId;
    if (input.search.periodsRange) {
        result.from = input.search.periodsRange.start;
        result.to = input.search.periodsRange.end;
    }
    return result;
}

export default function useProductBrowse(initialInput: ProductsInquiry, memberId?: string) {
    const router = useRouter();
    const cleanUrl = router.pathname === '/product';
    const initial = useRef(initialInput);
    const scope = (input: ProductsInquiry) => normalizeCatalogInput({ ...input,
        search: { ...input.search, ...(memberId ? { memberId } : {}) } });
    const [input, setInput] = useState<ProductsInquiry>(() => scope(initialInput));
    const [selection, setSelection] = useState<ProductCategorySelection>(() => categorySelectionFromTypes(scope(initialInput).search.typeList));

    useEffect(() => {
        if (!router.isReady) return;
        if (cleanUrl) {
            const restored = readProductUrl(router.query, initial.current);
            setInput(scope(restored.input));
            setSelection(restored.selection);
            return;
        }
        try {
            const raw = typeof router.query.input === 'string' ? JSON.parse(router.query.input) : initial.current;
            const sort = ['createdAt', 'updatedAt', 'productPrice', 'productLikes', 'productViews', 'productRank'].includes(raw.sort)
                ? raw.sort : 'createdAt';
            const { memberId: filterMemberId, pricesRange, text, periodsRange, typeList } = raw.search ?? {};
            setInput(scope({ page: Math.max(1, Number(raw.page) || 1), limit: Math.max(1, Number(raw.limit) || initial.current.limit),
                sort, direction: raw.direction === Direction.ASC ? Direction.ASC : Direction.DESC,
                search: { ...(filterMemberId ? { memberId: filterMemberId } : {}), ...(pricesRange ? { pricesRange } : {}),
                    ...(text ? { text } : {}), ...(periodsRange ? { periodsRange } : {}),
                    ...(Array.isArray(typeList) ? { typeList } : {}) } }));
        } catch {
            setInput(scope(initial.current));
        }
    }, [router.isReady, router.asPath, memberId]);

    const update = (next: ProductsInquiry, nextSelection: ProductCategorySelection) => {
        const value = scope(next);
        setInput(value);
        setSelection(nextSelection);
        if (cleanUrl) {
            const query = productUrlQuery(router.query, value, nextSelection, initial.current);
            const params = new URLSearchParams();
            Object.entries(query).forEach(([key, value]) => {
                if (Array.isArray(value)) value.forEach(item => params.append(key, item));
                else if (value !== undefined) params.set(key, value);
            });
            void router.push(`${router.pathname}?${params.toString().replace(/%2C/g, ',')}`, undefined, { shallow: true, scroll: false });
        } else {
            void router.push({ pathname: router.pathname, query: { ...router.query, input: JSON.stringify(value) } },
                undefined, { shallow: true, scroll: false });
        }
    };
    const changeInput = (next: ProductsInquiry) => {
        if (cleanUrl && !next.search.typeList) {
            update({ ...next, search: { ...next.search, typeList: [] } }, { categories: [], subcategories: [] });
        } else {
            const sameTypes = JSON.stringify(next.search.typeList) === JSON.stringify(input.search.typeList);
            update(next, sameTypes ? selection : categorySelectionFromTypes(next.search.typeList));
        }
    };
    const changeSelection = (next: ProductCategorySelection) => {
        update({ ...input, page: 1, search: { ...input.search, typeList: categorySelectionTypes(next) } }, next);
    };
    return [input, changeInput, selection, changeSelection] as const;
}
