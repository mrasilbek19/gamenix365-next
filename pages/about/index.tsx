import React from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box } from '@mui/material';

const About: NextPage = () => {
	const device = useDeviceDetect();

	return (
		<Stack className={'about-page'}>
			<Stack className={'intro'}>
				<Stack className={'container'}>
					<Stack className={'left'}>
						<strong>Built for every gamer.</strong>
					</Stack>
					<Stack className={'right'}>
						<p>
							Your setup. Your community. Gamenix365 brings gaming equipment and independent shops together.
							<br />
							<br />
							Explore products, share your setup, and connect with other gamers through community boards,
							tournaments and giveaways.
						</p>
						<Stack className={'boxes'}>
							<div className={'box'}>
								<div>
									<img src="/img/icons/garden.svg" alt="" />
								</div>
								<span>Gaming Equipment</span>
								<p>Find equipment for your next setup.</p>
							</div>
							<div className={'box'}>
								<div>
									<img src="/img/icons/securePayment.svg" alt="" />
								</div>
								<span>Independent Shops</span>
								<p>Discover shops in the gaming community.</p>
							</div>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
			<Stack className={'statistics'}>
				<Stack className={'container'}>
					<Stack className={'banner'}>
						<img src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1400&q=85" alt="" />
					</Stack>
					<Stack className={'info'}>
						<Box component={'div'}>
							<strong>Play</strong>
							<p>Gaming Equipment</p>
						</Box>
						<Box component={'div'}>
							<strong>Connect</strong>
							<p>Independent Shops</p>
						</Box>
						<Box component={'div'}>
							<strong>Compete</strong>
							<p>Tournaments & Giveaways</p>
						</Box>
					</Stack>
				</Stack>
			</Stack>
			<Stack className={'shops'}>
				<Stack className={'container'}>
					<span className={'title'}>Find Your Community</span>
					<p className={'desc'}>Independent shops. Shared passion.</p>
					<Stack className={'wrap'}>
						{/*{[1, 2, 3, 4, 5].map(() => {*/}
						{/*	return <ShopCard />;*/}
						{/*})}*/}
					</Stack>
				</Stack>
			</Stack>
			<Stack className={'options'}>
				<img src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1400&q=85" alt="" className={'about-banner'} />
				<Stack className={'container'}>
					<strong>Make your next move.</strong>
					<Stack>
						<div className={'icon-box'}>
							<img src="/img/icons/security.svg" alt="" />
						</div>
						<div className={'text-box'}>
							<span>Product Management</span>
							<p>Manage your products and connect with the gaming community.</p>
						</div>
					</Stack>
					<Stack>
						<div className={'icon-box'}>
							<img src="/img/icons/keywording.svg" alt="" />
						</div>
						<div className={'text_-box'}>
							<span>Product Management</span>
							<p>Manage your products and connect with the gaming community.</p>
						</div>
					</Stack>
					<Stack>
						<div className={'icon-box'}>
							<img src="/img/icons/investment.svg" alt="" />
						</div>
						<div className={'text-box'}>
							<span>Product Management</span>
							<p>Manage your products and connect with the gaming community.</p>
						</div>
					</Stack>
					<Stack className={'btn'}>
						Learn More
						<img src="/img/icons/rightup.svg" alt="" />
					</Stack>
				</Stack>
			</Stack>
			<Stack className={'partners'}>
				<Stack className={'container'}>
					<span>For the love of gaming and technology</span>
					<Stack className={'wrap'}>
						<img src="/img/icons/brands/amazon.svg" alt="" />
						<img src="/img/icons/brands/amd.svg" alt="" />
						<img src="/img/icons/brands/cisco.svg" alt="" />
						<img src="/img/icons/brands/dropcam.svg" alt="" />
						<img src="/img/icons/brands/spotify.svg" alt="" />
					</Stack>
				</Stack>
			</Stack>
			<Stack className={'help'}>
				<Stack className={'container'}>
					<Box component={'div'} className={'left'}>
						<strong>Need help? Talk to our expert.</strong>
						<p>Talk to our experts or Browse through more products.</p>
					</Box>
					<Box component={'div'} className={'right'}>
						<div className={'white'}>
							Contact Us
							<img src="/img/icons/rightup.svg" alt="" />
						</div>
						<div className={'black'}>
							<img src="/img/icons/call.svg" alt="" />
							920 851 9087
						</div>
					</Box>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(About);
