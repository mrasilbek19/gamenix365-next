import React, { useState } from 'react';
import { Stack, Modal, Divider, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import ProductCategories from '../product/ProductCategories';
import { PRODUCT_GROUPS, PRODUCT_TYPE_LABELS, getProductGroup, selectProductTypes } from '../../productCategories';
import { ProductsInquiry } from '../../types/product/product';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const style = {
	position: 'absolute' as const,
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'min(662px, calc(100vw - 32px))',
	backgroundColor: '#101426',
	borderRadius: '12px',
	outline: 'none',
	boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
};

interface HeaderFilterProps {
	initialInput?: ProductsInquiry;
}

const HeaderFilter = (props: HeaderFilterProps) => {
	const { initialInput = { page: 1, limit: 9, search: {} } } = props;
	const { t } = useTranslation('common');
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>({
		...initialInput, search: { ...initialInput.search, typeList: [...PRODUCT_GROUPS[0].types] },
	});
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const [openType, setOpenType] = useState(false);

	/** HANDLERS **/

	const resetFilterHandler = () => {
		setSearchFilter({ ...initialInput, page: 1, search: { typeList: [...PRODUCT_GROUPS[0].types] } });
	};

	const pushSearchHandler = async () => {
		await router.push({ pathname: '/product', query: { input: JSON.stringify(searchFilter) } });
	};

	return (
		<>
			<Stack className={'search-box'}>
				<Stack className={'select-box'}>
					<div className={`box ${openType ? 'on' : ''}`} role="button" tabIndex={0} aria-expanded={openType} aria-label="Choose product category" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenType(!openType); } if (e.key === 'Escape') setOpenType(false); }} onClick={() => setOpenType(!openType)}>
						<span>{searchFilter.search.typeList?.length === 1 ? PRODUCT_TYPE_LABELS[searchFilter.search.typeList[0]] : getProductGroup(searchFilter.search.typeList)?.label ?? 'All products'}</span>
						<ExpandMoreIcon />
					</div>
				</Stack>
				<div className={'search-input-box'}>
					<img src="/img/icons/search.svg" alt="" />
					<input type="text" value={searchFilter.search.text ?? ''} placeholder="What are you looking for?"
						onChange={e => setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, text: e.target.value } })} />
				</div>
				<Stack className={'search-box-other'}>
					<div className={'advanced-filter'} onClick={() => { setOpenType(false); setOpenAdvancedFilter(true); }}>
						<img src="/img/icons/tune.svg" alt="" />
						<span>{t('Advanced')}</span>
					</div>
					<div className={'search-btn'} onClick={pushSearchHandler}>
						<img src="/img/icons/search_white.svg" alt="Search" />
					</div>
				</Stack>
				<div className={`filter-type ${openType ? 'on' : ''}`} style={{ width: 'min(720px, calc(100vw - 48px))', padding: 0 }}>
					<ProductCategories types={searchFilter.search.typeList}
						onChange={types => setSearchFilter(selectProductTypes(searchFilter, types))} />
				</div>
			</Stack>
			<Modal open={openAdvancedFilter} onClose={() => setOpenAdvancedFilter(false)}>
				<div className={'filter-modal-shell'} style={style}>
					<div className={'advanced-filter-modal'}>
						<div className={'close'} onClick={() => setOpenAdvancedFilter(false)}><CloseIcon /></div>
						<div className={'top'}>
							<span>Find your equipment</span>
						</div>
						<Divider sx={{ mt: '30px', mb: '35px' }} />
						<div className={'middle'}>
							<div className={'row-box'}>
								<div className={'box'}>
									<span>Price range</span>
									<div className={'inside'}>
										<input type="number" min={0} step={1} aria-label="Minimum price" value={searchFilter.search.pricesRange?.start ?? 0}
											onChange={e => setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, pricesRange: { start: Number(e.target.value), end: searchFilter.search.pricesRange?.end ?? 2000000 } } })} />
										<input type="number" min={searchFilter.search.pricesRange?.start ?? 0} step={1} aria-label="Maximum price" value={searchFilter.search.pricesRange?.end ?? 2000000}
											onChange={e => setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, pricesRange: { start: searchFilter.search.pricesRange?.start ?? 0, end: Number(e.target.value) } } })} />
									</div>
								</div>
							</div>
						</div>
						<Divider sx={{ mt: '30px', mb: '35px' }} />
						<div className={'bottom'}>
							<div onClick={resetFilterHandler}><img src="/img/icons/reset.svg" alt="" /><span>Reset all filters</span></div>
							<Button className={'search-btn'} onClick={pushSearchHandler}>Search products</Button>
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default HeaderFilter;
