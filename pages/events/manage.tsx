import React from 'react';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import EventBoard from '../../libs/components/events/EventBoard';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
export const getStaticProps = async ({ locale }: any) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
function EventsPage() {
	const router = useRouter();
	return (
		<div className={'event-management-page'}>
			<EventBoard mode="shop" showCreateForm={router.query.category === 'createEvent'} />
		</div>
	);
}
export default withLayoutBasic(EventsPage);
