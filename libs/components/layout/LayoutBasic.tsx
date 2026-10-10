import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t, i18n } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);
		const user = useReactiveVar(userVar);

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				bgImage = '';

			switch (router.pathname) {
				case '/product':
					title = 'Gaming equipment';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/products.png';
					break;
				case '/shop':
					title = 'Shops';
					desc = 'Browse gaming shops';
					bgImage = '/img/banner/shops.webp';
					break;
				case '/shop/detail':
					title = 'Shop Profile';
					desc = 'Explore this shop and its products';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/orders':
					title = 'My Orders';
					desc = 'Review and manage your orders';
					bgImage = '/img/banner/header1.svg';
					break;
				case '/mypage':
					title = 'My account';
					desc = 'Your gaming community';
					bgImage = '/img/banner/header1.svg';
					break;
				case '/community':
					title = 'Community';
					desc = 'Stories, setups and conversations';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/community/detail':
					title = 'Community Detail';
					desc = 'Connect with the gaming community';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/cs':
					title = 'Support';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/account/join':
					title = 'Login/Signup';
					desc = 'Authentication Process';
					bgImage = '/img/banner/header2.svg';
					setAuthHeader(true);
					break;
				case '/member':
					title = 'Member Page';
					desc = 'Connect with the gaming community';
					bgImage = '/img/banner/header1.svg';
					break;
				case '/about':
					title = 'About Gamenix365';
					desc = 'Equipment, independent shops and a shared passion for gaming';
					break;
				case '/events':
				case '/events/detail':
				case '/events/manage':
				case '/events/registrations':
					title = 'Gaming events';
					desc = 'Tournaments, giveaways and your gaming community';
					break;
				default:
					break;
			}

			return { title, desc, bgImage };
		}, [router.pathname]);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		return (
			<>
				<Head>
					<title>Gamenix365</title>
					<meta name={'title'} content={`Gamenix365`} />
				</Head>
				<Stack id={device === 'mobile' ? 'mobile-wrap' : 'pc-wrap'} className={'public-layout basic-layout'}>
					<Stack id={'top'}>
						<Top />
					</Stack>

					<Stack
						className={`header-basic ${authHeader && 'auth'}`}
					>
						<Stack className={'container'}>
							<strong>{t(memoizedValues.title)}</strong>
							<span>{t(memoizedValues.desc)}</span>
						</Stack>
					</Stack>

					<Stack id={'main'}>
						<Component {...props} />
					</Stack>

					{device !== 'mobile' && <Chat />}

					<Stack id={'footer'}>
						<Footer />
					</Stack>
				</Stack>
			</>
		);
	};
};

export default withLayoutBasic;
