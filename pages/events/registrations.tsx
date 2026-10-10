import React from 'react';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyRegistrations from '../../libs/components/events/MyRegistrations';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
export const getStaticProps = async ({ locale }: any) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
function EventsPage() { return <MyRegistrations />; }
export default withLayoutBasic(EventsPage);
