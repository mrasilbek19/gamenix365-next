import React from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Member } from '../../types/member/member';

interface TopShopProps {
	shop: Member;
}
const TopShopCard = (props: TopShopProps) => {
	const { shop } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const shopImage = shop?.memberImage
		? `${process.env.REACT_APP_API_URL}/${shop?.memberImage}`
		: '/img/profile/defaultUser.svg';

	/** HANDLERS **/

	if (device === 'mobile') {
		return (
			<Stack className="top-shop-card" onClick={() => router.push(`/shop/detail?shopId=${shop._id}`)}>
				<img src={shopImage} alt="" />

				<strong>{shop?.memberNick}</strong>
				<span>Shop · {shop?.memberFollowers ?? 0} followers</span>
			</Stack>
		);
	} else {
		return (
			<Stack className="top-shop-card" onClick={() => router.push(`/shop/detail?shopId=${shop._id}`)}>
				<img src={shopImage} alt="" />

				<strong>{shop?.memberNick}</strong>
				<span>Shop · {shop?.memberFollowers ?? 0} followers</span>
			</Stack>
		);
	}
};

export default TopShopCard;
