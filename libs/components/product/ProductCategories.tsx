import React, { useState } from 'react';
import { Button, Checkbox, FormControlLabel, Stack, Tab, Tabs } from '@mui/material';
import KeyboardOutlined from '@mui/icons-material/KeyboardOutlined';
import MonitorOutlined from '@mui/icons-material/MonitorOutlined';
import MouseOutlined from '@mui/icons-material/MouseOutlined';
import HeadphonesOutlined from '@mui/icons-material/HeadphonesOutlined';
import DevicesOtherOutlined from '@mui/icons-material/DevicesOtherOutlined';
import PhoneAndroidOutlined from '@mui/icons-material/PhoneAndroidOutlined';
import SportsEsportsOutlined from '@mui/icons-material/SportsEsportsOutlined';
import VideogameAssetOutlined from '@mui/icons-material/VideogameAssetOutlined';
import MemoryOutlined from '@mui/icons-material/MemoryOutlined';
import DeveloperBoardOutlined from '@mui/icons-material/DeveloperBoardOutlined';
import ViewArrayOutlined from '@mui/icons-material/ViewArrayOutlined';
import ChairOutlined from '@mui/icons-material/ChairOutlined';
import TableRestaurantOutlined from '@mui/icons-material/TableRestaurantOutlined';
import { ProductType } from '../../enums/product.enum';
import { PRODUCT_GROUPS, PRODUCT_TYPE_LABELS, getProductGroup } from '../../productCategories';

const ICONS = {
	[ProductType.KEYBOARD]: KeyboardOutlined,
	[ProductType.MONITOR]: MonitorOutlined,
	[ProductType.MOUSE]: MouseOutlined,
	[ProductType.HEADPHONES]: HeadphonesOutlined,
	[ProductType.ACCESSORY]: DevicesOtherOutlined,
	[ProductType.GAMING_PHONE]: PhoneAndroidOutlined,
	[ProductType.PLAYSTATION]: SportsEsportsOutlined,
	[ProductType.CONTROLLER]: VideogameAssetOutlined,
	[ProductType.CPU]: MemoryOutlined,
	[ProductType.GPU]: DeveloperBoardOutlined,
	[ProductType.RAM]: ViewArrayOutlined,
	[ProductType.CHAIR]: ChairOutlined,
	[ProductType.DESK]: TableRestaurantOutlined,
};

export default function ProductCategories({
	types = [],
	onChange,
	onTypeSelect,
	layout = 'horizontal',
}: {
	types?: ProductType[];
	onChange: (types: ProductType[]) => void;
	onTypeSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	layout?: 'horizontal' | 'sidebar';
}) {
	const [expandedCategories, setExpandedCategories] = useState<string[]>(['pc']);
	const group = getProductGroup(types);
	const displayedTypes = group?.types ?? PRODUCT_GROUPS.flatMap((item) => item.types);

	/** HANDLERS **/
	const categoryExpandHandler = (id: string) => {
		if (expandedCategories.includes(id)) {
			setExpandedCategories(expandedCategories.filter((category) => category !== id));
		} else {
			setExpandedCategories([...expandedCategories, id]);
		}
	};

	const productTypeSelectHandler = (type: ProductType) => {
		if (types.includes(type)) {
			onChange(types.filter((value) => value !== type));
		} else {
			onChange([...types, type]);
		}
	};

	if (layout === 'sidebar') {
		return (
			<nav className="product-category-sidebar" aria-label="Product categories">
				<h2>Categories</h2>
				<Button className="category-option" aria-pressed={types.length === 0} onClick={() => onChange([])}>
					All products
				</Button>
				{PRODUCT_GROUPS.map((item) => {
					const expanded = expandedCategories.includes(item.id);
					return (
						<div className="category-section" key={item.id}>
							<FormControlLabel
								label={item.label}
								labelPlacement="start"
								className={`category-option category-toggle ${expanded ? 'selected' : ''}`}
								control={
									<Checkbox
										checked={expanded}
										inputProps={{ 'aria-expanded': expanded }}
										onChange={() => categoryExpandHandler(item.id)}
									/>
								}
							/>
							{expanded && (
								<div className="subcategory-list" role="group" aria-label={`${item.label} subcategories`}>
									{item.types.map((type) => (
										<FormControlLabel
											key={type}
											label={PRODUCT_TYPE_LABELS[type]}
											labelPlacement="start"
											className={`subcategory-option category-toggle ${types.includes(type) ? 'selected' : ''}`}
											control={
												<Checkbox
													value={type}
													checked={types.includes(type)}
													onChange={onTypeSelect || (() => productTypeSelectHandler(type))}
												/>
											}
										/>
									))}
								</div>
							)}
						</div>
					);
				})}
			</nav>
		);
	}
	return (
		<div
			className="product-categories"
			style={{
				width: '100%',
				minWidth: 0,
				boxSizing: 'border-box',
				marginBottom: 24,
				padding: 16,
				background: '#101426',
				border: '1px solid #282d45',
				borderRadius: 12,
			}}
		>
			<Tabs
				value={group?.id ?? false}
				variant="scrollable"
				scrollButtons="auto"
				allowScrollButtonsMobile
				aria-label="Product categories"
				onChange={(_, id) => onChange(PRODUCT_GROUPS.find((item) => item.id === id)!.types)}
				sx={{
					'& .MuiTab-root': { color: '#A5A8BD', textTransform: 'none', fontWeight: 600, minWidth: 90 },
					'& .Mui-selected': { color: '#fff !important' },
					'& .MuiTabs-indicator': { bgcolor: '#9747FF' },
				}}
			>
				{PRODUCT_GROUPS.map((item) => (
					<Tab key={item.id} value={item.id} label={item.label} />
				))}
			</Tabs>
			<Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
				<Button
					size="small"
					onClick={() => onChange(group?.types ?? [])}
					aria-pressed={group ? types.length === group.types.length : types.length === 0}
					sx={{ color: '#fff', textTransform: 'none' }}
				>
					{group ? 'All in this category' : 'All products'}
				</Button>
				{group && (
					<Button size="small" onClick={() => onChange([])} sx={{ color: '#A5A8BD', textTransform: 'none' }}>
						All products
					</Button>
				)}
			</Stack>
			<div role="group" aria-label="Product types" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
				{displayedTypes.map((type) => {
					const Icon = ICONS[type];
					const selected = types.length === 1 && types[0] === type;
					return (
						<Button
							key={type}
							aria-pressed={selected}
							onClick={() => onChange([type])}
							sx={{
								flexDirection: 'column',
								gap: 1,
								minWidth: { xs: 88, md: 105 },
								minHeight: 82,
								border: '1px solid',
								borderColor: selected ? '#9747FF' : '#30354d',
								borderRadius: 2,
								bgcolor: selected ? '#30204c' : '#15182B',
								color: selected ? '#fff' : '#A5A8BD',
								textTransform: 'none',
								'&:hover': { bgcolor: '#25203d', borderColor: '#9747FF' },
								'&.Mui-focusVisible': { outline: '2px solid #29B6F6', outlineOffset: 2 },
							}}
						>
							<Icon aria-hidden="true" fontSize="medium" />
							{PRODUCT_TYPE_LABELS[type]}
						</Button>
					);
				})}
			</div>
		</div>
	);
}
