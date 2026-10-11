import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
import ProductCard from '../../libs/components/product/ProductCard';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/product/Filter';
import { useRouter } from 'next/router';
import { ProductsInquiry } from '../../libs/types/product/product';
import { Product } from '../../libs/types/product/product';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ProductList: NextPage = ({ initialInput, ...props }: any) => {
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('New');

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const {
		loading: getProductsLoading,
		data: getProductsData,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.list ?? []);
			setTotal(data?.getProducts?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		const inputObj = router.query.input ? JSON.parse(router?.query?.input as string) : initialInput;
		setSearchFilter(inputObj);
		setCurrentPage(inputObj.page === undefined ? 1 : inputObj.page);

		if (inputObj.sort === 'productPrice') {
			setFilterSortName(inputObj.direction === Direction.ASC ? 'Lowest Price' : 'Highest Price');
		} else {
			setFilterSortName('New');
		}
	}, [router]);

	/** HANDLERS **/
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		const inputObj = { ...searchFilter, page: value };
		await router.push(
			`/product?input=${JSON.stringify(inputObj)}`,
			`/product?input=${JSON.stringify(inputObj)}`,
			{
				scroll: false,
			},
		);
		setCurrentPage(value);
		await getProductsRefetch({ input: inputObj });
	};

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = async (e: React.MouseEvent<HTMLLIElement>) => {
		const inputObj = { ...searchFilter };
		switch (e.currentTarget.id) {
			case 'new':
				inputObj.sort = 'createdAt';
				inputObj.direction = Direction.DESC;
				break;
			case 'lowest':
				inputObj.sort = 'productPrice';
				inputObj.direction = Direction.ASC;
				break;
			case 'highest':
				inputObj.sort = 'productPrice';
				inputObj.direction = Direction.DESC;
		}
		setSortingOpen(false);
		setAnchorEl(null);
		await router.push(
			`/product?input=${JSON.stringify(inputObj)}`,
			`/product?input=${JSON.stringify(inputObj)}`,
			{ scroll: false },
		);
	};

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetProduct({
				variables: { input: id },
			});
			await getProductsRefetch({ input: searchFilter });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeProductHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (getProductsError) return <Typography>{getProductsError.message}</Typography>;

	return (
		<div id="product-list-page" style={{ position: 'relative' }}>
			<div className="container">
				<Stack className={'product-page'}>
					<Stack className={'filter-config'} id={'product-filters'}>
						<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
					</Stack>
					<Stack className="main-config" mb={'76px'}>
						<Box component={'div'} className={'results-toolbar'}>
							<Typography className={'catalog-count'}>Showing {products.length} of {total} products</Typography>
							<Box component={'div'} className={'right'}>
								<span>Sort by</span>
								<div>
									<Button className={'sort-button'} onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
										{filterSortName}
									</Button>
									<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} sx={{ paddingTop: '5px' }}>
										<MenuItem
											onClick={sortingHandler}
											id={'new'}
											disableRipple
										>
											New
										</MenuItem>
										<MenuItem
											onClick={sortingHandler}
											id={'lowest'}
											disableRipple
										>
											Lowest Price
										</MenuItem>
										<MenuItem
											onClick={sortingHandler}
											id={'highest'}
											disableRipple
										>
											Highest Price
										</MenuItem>
									</Menu>
								</div>
							</Box>
						</Box>
						<Stack className={'list-config'}>
							{products?.length === 0 ? (
								<div className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p>No Products found!</p>
								</div>
							) : (
								products.map((product: Product) => {
									return (
										<ProductCard product={product} likeProductHandler={likeProductHandler} productPage={true} key={product?._id} />
									);
								})
							)}
						</Stack>
						<Stack className="pagination-config">
							{products.length !== 0 && (
								<Stack className="pagination-box">
									<Pagination
										page={currentPage}
										count={Math.ceil(total / searchFilter.limit)}
										onChange={handlePaginationChange}
										shape="circular"
										color="primary"
									/>
								</Stack>
							)}

							{products.length !== 0 && (
								<Stack className="total-result">
									<Typography>
										Total {total} product{total > 1 ? 's' : ''} available
									</Typography>
								</Stack>
							)}
						</Stack>
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

ProductList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			pricesRange: {
				start: 0,
				end: 2000000,
			},
		},
	},
};

export default withLayoutBasic(ProductList);
