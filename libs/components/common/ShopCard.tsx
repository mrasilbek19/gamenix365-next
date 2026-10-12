import React from 'react';
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
	const user = useReactiveVar(userVar);
	const shopName = shop.memberFullName || shop.memberNick;
	const shopLink = { pathname: '/shop/detail', query: { shopId: shop._id } };
	const imagePath: string = shop?.memberImage
		? `${REACT_APP_API_URL}/${shop?.memberImage}`
		: '/img/profile/defaultUser.svg';

	return (
		<Stack className="shop-general-card">
			<Link className={'shop-profile-link'} href={shopLink} aria-label={`View ${shopName}`} />
			<Box component={'div'} className={'shop-img'}>
				<img src={imagePath} alt={shopName} loading="lazy" />
			</Box>
			<Stack className={'shop-desc'}>
				<Typography component={'h2'} className={'shop-name'}>
					{shopName}
				</Typography>
				{shop.memberDesc && <Typography className={'shop-description'}>{shop.memberDesc}</Typography>}
				<Typography className={'shop-product-count'}>
					{shop.memberProducts ?? 0} product{shop.memberProducts === 1 ? '' : 's'}
				</Typography>
			</Stack>
			<Stack className={'shop-card-footer'} direction={'row'}>
				<Box component={'div'} className={'buttons'}>
					<RemoveRedEyeIcon fontSize={'small'} />
					<Typography className="view-cnt" aria-label={`${shop.memberViews ?? 0} views`}>
						{shop.memberViews ?? 0}
					</Typography>
					<IconButton
						className={'shop-like'}
						aria-label={`Like ${shopName}`}
						aria-pressed={Boolean(shop.meLiked?.[0]?.myFavorite)}
						onClick={() => likeMemberHandler(user, shop._id)}
					>
						{shop?.meLiked && shop?.meLiked[0]?.myFavorite ? (
							<FavoriteIcon color={'primary'} />
						) : (
							<FavoriteBorderIcon />
						)}
					</IconButton>
					<Typography className="view-cnt" aria-label={`${shop.memberLikes ?? 0} likes`}>
						{shop.memberLikes ?? 0}
					</Typography>
				</Box>
				<Link href={shopLink} className={'view-shop'}>
					View Shop
				</Link>
			</Stack>
		</Stack>
	);
};

export default ShopCard;
