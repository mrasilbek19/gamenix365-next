import React, { useCallback, useEffect, useState } from 'react';
import { Stack, Typography, OutlinedInput, InputAdornment, Tooltip, IconButton, Button } from '@mui/material';
import { ProductsInquiry } from '../../types/product/product';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshIcon from '@mui/icons-material/Refresh';
import ProductCategories from './ProductCategories';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { ProductType } from '../../enums/product.enum';

interface FilterType {
	searchFilter: ProductsInquiry;
	setSearchFilter: (input: ProductsInquiry) => void;
	initialInput: ProductsInquiry;
	updateUrl?: boolean;
}

const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput, updateUrl = true } = props;
	const router = useRouter();
	const [searchText, setSearchText] = useState<string>('');

	/** LIFECYCLES **/
	useEffect(() => {
		if (updateUrl) setSearchText(searchFilter?.search?.text ?? '');
	}, [searchFilter.search.text, updateUrl]);

	/** HANDLERS **/
	const searchHandler = async (text: string) => {
		const inputObj = {
			...searchFilter,
			page: updateUrl ? 1 : searchFilter.page,
			search: { ...searchFilter.search, text },
		};
		setSearchText(text);
		setSearchFilter(inputObj);
		if (!updateUrl) return;
		await router.push(
			`/product?input=${JSON.stringify(inputObj)}`,
			`/product?input=${JSON.stringify(inputObj)}`,
			{ scroll: false },
		);
	};

	const productTypeSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/product?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, typeList: [...(searchFilter?.search?.typeList || []), value] },
						})}`,
						`/product?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, typeList: [...(searchFilter?.search?.typeList || []), value] },
						})}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.typeList?.includes(value)) {
					const typeList = searchFilter.search.typeList.filter((item: string) => item !== value);
					await router.push(
						`/product?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								typeList: typeList.length ? typeList : undefined,
							},
						})}`,
						`/product?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								typeList: typeList.length ? typeList : undefined,
							},
						})}`,
						{ scroll: false },
					);
				}
			} catch (err: any) {
				console.log('ERROR, productTypeSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productTypesChangeHandler = async (types: ProductType[]) => {
		await router.push(
			`/product?input=${JSON.stringify({
				...searchFilter,
				search: { ...searchFilter.search, typeList: types.length ? types : undefined },
			})}`,
			`/product?input=${JSON.stringify({
				...searchFilter,
				search: { ...searchFilter.search, typeList: types.length ? types : undefined },
			})}`,
			{ scroll: false },
		);
	};

	const productPriceHandler = useCallback(
		async (value: number, type: string) => {
			if (!Number.isInteger(value * 1) || value < 0) return;
			if (type == 'start' && value * 1 > (searchFilter.search.pricesRange?.end ?? 2000000)) return;
			if (type == 'end' && value * 1 < (searchFilter.search.pricesRange?.start ?? 0)) return;
			if (!updateUrl) {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						pricesRange: { start: 0, end: 2000000, ...searchFilter.search.pricesRange, [type]: value * 1 },
					},
				});
				return;
			}
			if (type == 'start') {
				await router.push(
					`/product?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { end: 2000000, ...searchFilter.search.pricesRange, start: value * 1 },
						},
					})}`,
					`/product?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { end: 2000000, ...searchFilter.search.pricesRange, start: value * 1 },
						},
					})}`,
					{ scroll: false },
				);
			} else {
				await router.push(
					`/product?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { start: 0, ...searchFilter.search.pricesRange, end: value * 1 },
						},
					})}`,
					`/product?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { start: 0, ...searchFilter.search.pricesRange, end: value * 1 },
						},
					})}`,
					{ scroll: false },
				);
			}
		},
		[searchFilter],
	);

	const refreshHandler = async () => {
		try {
			setSearchText('');
			if (!updateUrl) {
				setSearchFilter(initialInput);
				return;
			}
			await router.push(
				`/product?input=${JSON.stringify(initialInput)}`,
				`/product?input=${JSON.stringify(initialInput)}`,
				{ scroll: false },
			);
		} catch (err: any) {
			console.log('ERROR, refreshHandler:', err);
		}
	};

	return (
		<Stack className={'filter-main'}>
			<Stack className={'find-your-home'} mb={'40px'}>
				<Typography className={'title-main'}>Find Your Equipment</Typography>
				<Stack className={'input-box'}>
					<OutlinedInput
						value={searchText}
						type={'text'}
						className={'search-input'}
						placeholder={'What are you looking for?'}
						inputProps={{ 'aria-label': 'Search products' }}
						startAdornment={
							updateUrl ? (
								<InputAdornment position="start">
									<IconButton size="small" aria-label="Search products" onClick={() => searchHandler(searchText)}>
										<SearchRoundedIcon />
									</IconButton>
								</InputAdornment>
							) : undefined
						}
						onChange={(e: any) => setSearchText(e.target.value)}
						onKeyDown={(event: any) => {
							if (event.key == 'Enter') {
								searchHandler(searchText);
							}
						}}
						endAdornment={
							<InputAdornment position="end">
								<IconButton
									size="small"
									aria-label="Clear product search"
									onClick={() => searchHandler('')}
								>
									<CancelRoundedIcon fontSize="small" />
								</IconButton>
							</InputAdornment>
						}
					/>
					{!updateUrl && <img src={'/img/icons/search_icon.png'} alt={''} />}
					{!updateUrl && (
						<Tooltip title="Reset">
							<IconButton onClick={refreshHandler}>
								<RefreshIcon />
							</IconButton>
						</Tooltip>
					)}
				</Stack>
			</Stack>
			{updateUrl && (
				<ProductCategories
					layout="sidebar"
					types={searchFilter.search.typeList}
					onChange={productTypesChangeHandler}
					onTypeSelect={productTypeSelectHandler}
				/>
			)}
			<Stack className={'find-your-home'}>
				<Typography className={'title'}>Price Range</Typography>
				<Stack className="square-year-input">
					<input
						type="number"
						placeholder="$ min"
						min={0}
						value={searchFilter?.search?.pricesRange?.start ?? 0}
						onChange={(e: any) => {
							if (e.target.value >= 0) {
								productPriceHandler(e.target.value, 'start');
							}
						}}
					/>
					<div className="central-divider"></div>
					<input
						type="number"
						placeholder="$ max"
						value={searchFilter?.search?.pricesRange?.end ?? 2000000}
						onChange={(e: any) => {
							if (e.target.value >= 0) {
								productPriceHandler(e.target.value, 'end');
							}
						}}
					/>
				</Stack>
			</Stack>
			{updateUrl && (
				<Button className="reset-product-filters" onClick={refreshHandler}>
					Reset filters
				</Button>
			)}
		</Stack>
	);
};

export default Filter;
