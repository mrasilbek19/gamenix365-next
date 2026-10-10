import React from 'react';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import EventBoard from '../../libs/components/events/EventBoard';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
export const getStaticProps = async ({ locale }: any) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
function EventsPage() {
	return (
		<div className={'event-management-page'}>
			<EventBoard mode="shop" />
		</div>
	);
}
export default withLayoutBasic(EventsPage);
