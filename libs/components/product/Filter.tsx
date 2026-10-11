import React, { useEffect, useState } from 'react';
import { Stack, Typography, OutlinedInput, InputAdornment, Tooltip, IconButton, Button } from '@mui/material';
import { ProductsInquiry } from '../../types/product/product';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshIcon from '@mui/icons-material/Refresh';

interface FilterType {
	searchFilter: ProductsInquiry;
	setSearchFilter: (input: ProductsInquiry) => void;
	initialInput: ProductsInquiry;
	updateUrl?: boolean;
	children?: React.ReactNode;
}

const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput, updateUrl = true, children } = props;
	const router = useRouter();
	const [searchText, setSearchText] = useState<string>(searchFilter.search.text ?? '');

	/** LIFECYCLES **/
	useEffect(() => {
		setSearchText(searchFilter.search.text ?? '');
	}, [searchFilter.search.text]);

	/** HANDLERS **/
	const changeFilterHandler = async (input: ProductsInquiry) => {
		setSearchFilter(input);
		if (updateUrl) await router.push({ pathname: '/product', query: { input: JSON.stringify(input) } }, undefined, { scroll: false });
	};


	const productPriceHandler = (value: number, type: string) => {
		if (!Number.isInteger(Number(value)) || Number(value) < 0) return;
		const pricesRange = { start: 0, end: 2000000, ...searchFilter.search.pricesRange, [type]: Number(value) };
		if (pricesRange.start > pricesRange.end) return;
		changeFilterHandler({ ...searchFilter, page: 1, search: { ...searchFilter.search, pricesRange } });
	};

	const refreshHandler = async () => {
		setSearchText('');
		await changeFilterHandler({ ...initialInput, page: 1 });
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
							startAdornment={children ? <InputAdornment position="start"><img src="/img/icons/search_icon.png" alt="" /></InputAdornment> : undefined}
							onChange={(e: any) => setSearchText(e.target.value)}
							onKeyDown={(event: any) => {
								if (event.key == 'Enter') {
									changeFilterHandler({ ...searchFilter, page: 1, search: { ...searchFilter.search, text: searchText } });
								}
							}}
							endAdornment={
								<InputAdornment position="end">
									<IconButton size="small" aria-label="Clear product search"
										onClick={() => {
											setSearchText('');
											changeFilterHandler({ ...searchFilter, page: 1, search: { ...searchFilter.search, text: '' } });
										}}
									><CancelRoundedIcon fontSize="small" /></IconButton>
								</InputAdornment>
							}
						/>
						{!children && <img src={'/img/icons/search_icon.png'} alt={''} />}
						{!children && <Tooltip title="Reset">
							<IconButton onClick={refreshHandler}>
								<RefreshIcon />
							</IconButton>
						</Tooltip>}
					</Stack>
				</Stack>
				{children}
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
			{children && <Button className="reset-product-filters" onClick={refreshHandler}>Reset filters</Button>}
		</Stack>
	);
};

export default Filter;
