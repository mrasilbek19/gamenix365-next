import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { userVar } from '../../apollo/store';
import { GET_EVENT, GET_MY_REGISTRATIONS } from '../../apollo/user/query';
import { REGISTER_EVENT, CANCEL_EVENT_REGISTRATION } from '../../apollo/user/mutation';
import { GamingEvent } from '../../libs/types/event/event';
import { imageUrl } from '../../libs/uploads';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Participants from '../../libs/components/events/Participants';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
export const getStaticProps = async ({ locale }: any) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
function EventDetail() {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [message, setMessage] = useState('');
	const [register, { loading: registering }] = useMutation(REGISTER_EVENT);
	const [cancel, { loading: cancelling }] = useMutation(CANCEL_EVENT_REGISTRATION);
	const { data, loading, error } = useQuery(GET_EVENT, { variables: { input: router.query.id }, skip: !router.isReady || !router.query.id, fetchPolicy: 'network-only' });
	const enabled = user.memberType === 'USER' && user.memberStatus === 'ACTIVE';
	const registrations = useQuery(GET_MY_REGISTRATIONS, { variables: { input: { page: 1, limit: 10, search: { eventId: router.query.id } } }, skip: !enabled || !router.query.id, fetchPolicy: 'network-only' });
	const event: GamingEvent = data?.getEvent;
	const application = registrations.data?.getMyRegistrations?.list?.[0];
	if (loading) return <Typography sx={{ p: 3 }}>Loading event…</Typography>;
	if (error) return <Alert severity="error">{error.message}</Alert>;
	if (!event) return <Alert severity="info">Event unavailable.</Alert>;
	const closed = !!event.deletedAt || event.eventStatus === 'FINISHED' || new Date(event.eventStart).getTime() <= Date.now();
	return <Stack spacing={2} sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto', width: '100%' }}>
		<Typography variant="h4">{event.eventTitle}</Typography><img src={imageUrl(event.eventImage)} alt={event.eventTitle} style={{ maxHeight: 360, width: '100%', objectFit: 'contain' }} />
		<Typography>{event.eventDesc}</Typography><Typography>{event.eventType} · {event.eventGame} · {event.eventStatus}</Typography>
		<Typography>Scheduled: {new Date(event.eventDate).toLocaleString()}</Typography><Typography>Starts: {new Date(event.eventStart).toLocaleString()} · Ends: {new Date(event.eventEnd).toLocaleString()}</Typography>
		<Typography>Prize: {event.eventPrize} · Capacity: {event.eventMaxParticipants} approved participants</Typography><Link href={`/agent/detail?agentId=${event.eventOrganizer}`}>Organizer shop</Link>
		{message && <Alert severity="error">{message}</Alert>}{registrations.error && <Alert severity="error">{registrations.error.message}</Alert>}
		{enabled && <><Typography>My application: {application?.participantStatus ?? 'Not applied'}</Typography>
			{(!application || application.participantStatus === 'CANCELLED') && <Button variant="contained" disabled={registering || registrations.loading || closed || event.eventStatus !== 'PROCESS'} onClick={async () => { try { setMessage(''); await register({ variables: { input: { eventId: event._id } } }); await registrations.refetch(); } catch (err: any) { setMessage(err.message); } }}>Apply for approval</Button>}
			{application && ['PENDING','REGISTERED'].includes(application.participantStatus) && <Button disabled={cancelling || closed} onClick={async () => { try { setMessage(''); await cancel({ variables: { input: event._id } }); await registrations.refetch(); } catch (err: any) { setMessage(err.message); } }}>Cancel registration</Button>}
		</>}
		{!user._id && <Link href={`/account/join?referrer=${encodeURIComponent(`/events/detail?id=${event._id}`)}`}>Log in to apply</Link>}
		{user.memberStatus === 'ACTIVE' && (user.memberType === 'ADMIN' || (user.memberType === 'SHOP' && user._id === event.eventOrganizer)) && <Participants event={event} />}
	</Stack>;
}
export default withLayoutBasic(EventDetail);
