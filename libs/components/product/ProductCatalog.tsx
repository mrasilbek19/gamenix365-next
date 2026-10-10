import React, { useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Box, CircularProgress, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';
import { GET_PRODUCTS, GET_FAVORITES, GET_VISITED } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { Product } from '../../types/product/product';
import Filter from './Filter';
import ProductCard from './ProductCard';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { ProductsInquiry } from '../../types/product/product';
import { Direction } from '../../enums/common.enum';
import { sweetMixinErrorAlert } from '../../sweetAlert';

export default function ProductCatalog({ mode = 'public', memberId, initialSearch = {} }: { mode?: 'public' | 'favorites' | 'visited'; memberId?: string; initialSearch?: any }) {
	const user = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const initialInput: ProductsInquiry = { page: 1, limit: 12, search: initialSearch };
	const [filter, setFilter] = useState<ProductsInquiry>(initialInput);
	const [sorting, setSorting] = useState('createdAt:DESC');
	const [sort, direction] = sorting.split(':');
	const input = mode === 'public' ? { ...filter, page, sort, direction: direction as Direction, search: {
		...filter.search, ...(memberId ? { memberId } : {}),
	} } : { page, limit: 12 };
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const query = mode === 'favorites' ? GET_FAVORITES : mode === 'visited' ? GET_VISITED : GET_PRODUCTS;
	const field = mode === 'favorites' ? 'getFavorites' : mode === 'visited' ? 'getVisited' : 'getProducts';
	const { data, loading, error, refetch } = useQuery(query, { variables: { input }, skip: mode !== 'public' && !user._id, fetchPolicy: 'cache-and-network' });
	const likeProductHandler = async (_: any, id: string) => {
		try {
			if (!user._id) throw new Error('Please log in first.');
			await likeTargetProduct({ variables: { input: id } });
			await refetch();
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	};
	if (mode !== 'public' && !user._id) return <Alert severity="info">Please log in to view your products.</Alert>;
	const result = data?.[field];
	return <Stack spacing={3} sx={{ p: { xs: 2, md: 4 }, width: '100%' }}>
		<Typography variant="h4">{mode === 'public' ? 'Gaming equipment' : mode === 'favorites' ? 'Favorite products' : 'Recently viewed products'}</Typography>
		{mode === 'public' && <><Filter searchFilter={filter} setSearchFilter={value => { setFilter(value); setPage(1); }} initialInput={initialInput} updateUrl={false} />
			<TextField select label="Sort" value={sorting} onChange={e => { setSorting(e.target.value); setPage(1); }} sx={{ maxWidth: 260 }}>
				{[['createdAt:DESC','Newest'],['productPrice:ASC','Price: low to high'],['productPrice:DESC','Price: high to low'],['productLikes:DESC','Most liked'],['productViews:DESC','Most viewed']].map(([value,label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
			</TextField></>}
		{loading && <CircularProgress />}{error && <Alert severity="error">{error.message}</Alert>}
		{!loading && !error && !result?.list?.length && <Alert severity="info">No products found.</Alert>}
		<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 24 }}>
			{result?.list?.map((product: Product) => <ProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} myFavorites={mode === 'favorites'} recentlyVisited={mode === 'visited'} />)}
		</div>
		<Pagination page={page} count={Math.max(1, Math.ceil((result?.metaCounter?.[0]?.total ?? 0) / 12))} onChange={(_, next) => setPage(next)} />
	</Stack>;
}
