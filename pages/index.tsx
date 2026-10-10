import { NextPage } from 'next';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import PopularProducts from '../libs/components/homepage/PopularProducts';
import TopShops from '../libs/components/homepage/TopShops';
import Events from '../libs/components/homepage/Events';
import TrendProducts from '../libs/components/homepage/TrendProducts';
import TopProducts from '../libs/components/homepage/TopProducts';
import { Stack } from '@mui/material';
import Advertisement from '../libs/components/homepage/Advertisement';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'home-page'}>
				<TrendProducts />
				<PopularProducts />
				<Advertisement />
				<TopProducts />
				<TopShops />
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<TrendProducts />
				<PopularProducts />
				<Advertisement />
				<TopProducts />
				<TopShops />
				<Events />
				<CommunityBoards />
			</Stack>
		);
	}
};

export default withLayoutMain(Home);
