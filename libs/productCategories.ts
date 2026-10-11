import { ProductType } from './enums/product.enum';
import { ProductsInquiry } from './types/product/product';

export const PRODUCT_GROUPS: { id: string; label: string; types: ProductType[] }[] = [
    { id: 'pc', label: 'PC', types: [ProductType.KEYBOARD, ProductType.MONITOR, ProductType.MOUSE, ProductType.HEADPHONES, ProductType.ACCESSORY] },
    { id: 'mobile', label: 'Mobile', types: [ProductType.GAMING_PHONE] },
    { id: 'console', label: 'Console', types: [ProductType.PLAYSTATION, ProductType.CONTROLLER] },
    { id: 'components', label: 'PC Components', types: [ProductType.CPU, ProductType.GPU, ProductType.RAM] },
    { id: 'furniture', label: 'Furniture', types: [ProductType.CHAIR, ProductType.DESK] },
];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
    [ProductType.KEYBOARD]: 'Keyboard', [ProductType.MONITOR]: 'Monitor', [ProductType.MOUSE]: 'Mouse',
    [ProductType.HEADPHONES]: 'Headphones', [ProductType.ACCESSORY]: 'Accessories',
    [ProductType.GAMING_PHONE]: 'Gaming Phone', [ProductType.PLAYSTATION]: 'PlayStation',
    [ProductType.CONTROLLER]: 'Controller', [ProductType.CPU]: 'CPU', [ProductType.GPU]: 'GPU',
    [ProductType.RAM]: 'RAM', [ProductType.CHAIR]: 'Chair', [ProductType.DESK]: 'Desk',
};

export function getProductGroup(types: ProductType[] = []) {
    return types.length ? PRODUCT_GROUPS.find(group => types.every(type => group.types.includes(type))) : undefined;
}

// Only existing API fields are sent; grouping is represented by typeList.
export function normalizeCatalogInput(input: ProductsInquiry): ProductsInquiry {
    const types = input.search?.typeList;
    const typeList = Array.isArray(types)
        ? types.filter(type => Object.values(ProductType).includes(type))
        : [...PRODUCT_GROUPS[0].types];
    return { ...input, search: { ...input.search, typeList } };
}

export function selectProductTypes(input: ProductsInquiry, types: ProductType[]): ProductsInquiry {
    return { ...input, page: 1, search: { ...input.search, typeList: [...types] } };
}

export interface ProductCategorySelection {
    categories: string[];
    subcategories: ProductType[];
}

export function categorySelectionFromTypes(types: ProductType[] = []): ProductCategorySelection {
    const groups = PRODUCT_GROUPS.filter(group => group.types.some(type => types.includes(type)));
    return {
        categories: groups.map(group => group.id),
        subcategories: groups.flatMap(group => group.types.every(type => types.includes(type))
            ? [] : group.types.filter(type => types.includes(type))),
    };
}

export function categorySelectionTypes(selection: ProductCategorySelection): ProductType[] {
    return PRODUCT_GROUPS.filter(group => selection.categories.includes(group.id)).flatMap(group => {
        const selected = group.types.filter(type => selection.subcategories.includes(type));
        return selected.length ? selected : group.types;
    });
}
