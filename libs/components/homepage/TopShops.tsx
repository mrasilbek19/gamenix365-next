import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopShopCard from './TopShopCard';
import { Member } from '../../types/member/member';
import { ShopsInquiry } from '../../types/member/member.input';
import { GET_SHOPS } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';
import { T } from '../../types/common';

interface TopShopsProps {
	initialInput: ShopsInquiry;
}

const TopShops = (props: TopShopsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [topShops, setTopShops] = useState<Member[]>([]);

	/** APOLLO REQUESTS **/
	const {
		loading: getShopsLoading,
		data: getShopsData,
		error: getShopsError,
		refetch: getShopsRefetch,
	} = useQuery(GET_SHOPS, {
		fetchPolicy: "cache-and-network",
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopShops(data?.getShops?.list);
		},
	});
	/** HANDLERS **/

	if (device === 'mobile') {
		return (
			<Stack className={'top-shops'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Top Shops</span>
					</Stack>
					<Stack className={'wrapper'}>
						<Swiper
							className={'top-shops-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={29}
							modules={[Autoplay]}
						>
							{topShops.map((shop: Member) => {
								return (
									<SwiperSlide className={'top-shops-slide'} key={shop?._id}>
										<TopShopCard shop={shop} key={shop?.memberNick} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'top-shops'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Top Shops</span>
							<p>Our Top Shops always ready to serve you</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'more-box'} onClick={() => router.push('/shop')}>
								<span>See All Shops</span>
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
						</Box>
					</Stack>
					<Stack className={'wrapper'}>
						<Box component={'div'} className={'switch-btn swiper-shops-prev'}>
							<ArrowBackIosNewIcon />
						</Box>
						<Box component={'div'} className={'card-wrapper'}>
							<Swiper
								className={'top-shops-swiper'}
								slidesPerView={'auto'}
								spaceBetween={29}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-shops-next',
									prevEl: '.swiper-shops-prev',
								}}
							>
								{topShops.map((shop: Member) => {
									return (
										<SwiperSlide className={'top-shops-slide'} key={shop?._id}>
											<TopShopCard shop={shop} key={shop?.memberNick} />
										</SwiperSlide>
									);
								})}
							</Swiper>
						</Box>
						<Box component={'div'} className={'switch-btn swiper-shops-next'}>
							<ArrowBackIosNewIcon />
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TopShops.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopShops;
