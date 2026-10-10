import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { ProductsInquiry } from '../types/product/product';
import { normalizeCatalogInput } from '../productCategories';
import { Direction } from '../enums/common.enum';

export default function useProductBrowse(initialInput: ProductsInquiry, memberId?: string) {
    const router = useRouter();
    const initial = useRef(initialInput);
    const scope = (input: ProductsInquiry) => normalizeCatalogInput({ ...input,
        search: { ...input.search, ...(memberId ? { memberId } : {}) } });
    const [input, setInput] = useState<ProductsInquiry>(() => scope(initialInput));

    useEffect(() => {
        if (!router.isReady) return;
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
    }, [router.isReady, router.query.input, memberId]);

    const changeInput = (next: ProductsInquiry) => {
        const value = scope(next);
        setInput(value);
        void router.push({ pathname: router.pathname, query: { ...router.query, input: JSON.stringify(value) } },
            undefined, { shallow: true, scroll: false });
    };
    return [input, changeInput] as const;
}
