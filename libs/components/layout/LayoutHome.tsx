import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HeaderFilter from '../homepage/HeaderFilter';
import { userVar } from '../../../apollo/store';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const user = useReactiveVar(userVar);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>Gamenix365 | Gaming Equipment & Community</title>
						<meta name={'title'} content={`Gamenix365`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack className={'header-main'}>
							<Stack className={'hero-banner'}>
								<Stack className={'hero-content'}>
									<span className={'hero-label'}>YOUR NEXT LEVEL STARTS HERE</span>
									<h1>Level up your<br />gaming setup.</h1>
									<p>Discover gaming equipment from trusted shops.</p>
									<Link href={'/product'} className={'hero-button'}>
										Explore Products <ArrowForwardIcon />
									</Link>
								</Stack>
								<img
									className={'hero-image'}
									src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1800&q=85"
									alt="Gaming setup with a monitor and controllers in purple lighting"
								/>
							</Stack>
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>Gamenix365 | Gaming Equipment & Community</title>
						<meta name={'title'} content={`Gamenix365`} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack className={'header-main'}>
							<Stack className={'hero-banner'}>
								<Stack className={'hero-content'}>
									<span className={'hero-label'}>YOUR NEXT LEVEL STARTS HERE</span>
									<h1>Level up your<br />gaming setup.</h1>
									<p>Discover gaming equipment from trusted shops.</p>
									<Link href={'/product'} className={'hero-button'}>
										Explore Products <ArrowForwardIcon />
									</Link>
								</Stack>
								<img
									className={'hero-image'}
									src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1800&q=85"
									alt="Gaming setup with a monitor and controllers in purple lighting"
								/>
							</Stack>
							<Stack className={'container'}>
								<HeaderFilter />
							</Stack>
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Chat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutMain;
