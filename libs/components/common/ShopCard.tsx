import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { Member } from '../../types/member/member';
import { userVar } from '../../../apollo/store';

interface ShopCardProps {
	shop: Member;
	likeMemberHandler: any;
}

const ShopCard = (props: ShopCardProps) => {
	const { shop, likeMemberHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = shop?.memberImage
		? `${REACT_APP_API_URL}/${shop?.memberImage}`
		: '/img/profile/defaultUser.svg';

	return (
		<Stack className="shop-general-card">
			<Link
				href={{
					pathname: '/shop/detail',
					query: { shopId: shop?._id },
				}}
			>
				<Box
					component={'div'}
					className={'shop-img'}
					style={{
						backgroundImage: `url(${imagePath})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
					}}
				>
					<div>{shop?.memberProducts} products</div>
				</Box>
			</Link>

			<Stack className={'shop-desc'}>
				<Box component={'div'} className={'shop-info'}>
					<Link
						href={{
							pathname: '/shop/detail',
							query: { shopId: shop?._id },
						}}
					>
						<strong>{shop?.memberFullName ?? shop?.memberNick}</strong>
					</Link>
					<span>Shop</span>
					{shop?.memberDesc && <Typography variant="body2" sx={{ maxWidth: 160, overflowWrap: 'anywhere' }}>{shop.memberDesc}</Typography>}
					<Typography variant="body2">{shop?.memberFollowers ?? 0} followers</Typography>
				</Box>
				<Box component={'div'} className={'buttons'}>
					<IconButton color={'default'}>
						<RemoveRedEyeIcon />
					</IconButton>
					<Typography className="view-cnt">{shop?.memberViews}</Typography>
					<IconButton color={'default'} onClick={() => likeMemberHandler(user, shop?._id)}>
						{shop?.meLiked && shop?.meLiked[0]?.myFavorite ? (
							<FavoriteIcon color={'primary'} />
						) : (
							<FavoriteBorderIcon />
						)}
					</IconButton>
					<Typography className="view-cnt">{shop?.memberLikes}</Typography>
				</Box>
			</Stack>
		</Stack>
	);
};

export default ShopCard;
