import React, { useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Card, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_MY_REGISTRATIONS } from '../../../apollo/user/query';
import { CANCEL_EVENT_REGISTRATION } from '../../../apollo/user/mutation';
import { EventParticipant } from '../../types/event/event';
import { ParticipantStatus } from '../../enums/event.enum';
import { sweetConfirmAlert } from '../../sweetAlert';

const MyRegistrations = () => {
	const user = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState('');
	const [message, setMessage] = useState('');
	const allowed = user.memberType === 'USER' && user.memberStatus === 'ACTIVE';

	/** APOLLO REQUESTS **/
	const { data, loading, error, refetch } = useQuery(GET_MY_REGISTRATIONS, {
		variables: { input: { page, limit: 10, search: status ? { participantStatus: status } : {} } },
		skip: !allowed,
		fetchPolicy: 'network-only',
	});
	const [cancelRegistration, { loading: cancelling }] = useMutation(CANCEL_EVENT_REGISTRATION);
	const registrations: EventParticipant[] = data?.getMyRegistrations?.list ?? [];

	/** HANDLERS **/
	const cancelHandler = async (eventId: string) => {
		try {
			if (!(await sweetConfirmAlert('Cancel this registration?'))) return;
			setMessage('');
			await cancelRegistration({ variables: { input: eventId } });
			await refetch();
		} catch (err: any) {
			setMessage(err.message);
		}
	};

	if (!allowed) return <Alert severity="info">Log in with an active user account to view your registrations.</Alert>;
	return (
		<Stack className={'event-registrations'} spacing={3} sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto', width: '100%' }}>
			<Typography variant="h4">My Registrations</Typography>
			<Link href="/events">Browse events</Link>
			<TextField
				select
				label="Application status"
				value={status}
				onChange={(e) => {
					setStatus(e.target.value);
					setPage(1);
				}}
			>
				<MenuItem value="">All statuses</MenuItem>
				{Object.values(ParticipantStatus).map((value) => (
					<MenuItem key={value} value={value}>
						{value}
					</MenuItem>
				))}
			</TextField>
			{message && <Alert severity="error">{message}</Alert>}
			{error && <Alert severity="error">{error.message}</Alert>}
			{loading && <Typography>Loading registrations...</Typography>}
			{!loading && !error && !registrations.length && <Typography>No registrations found.</Typography>}
			{registrations.map((registration) => {
				const event = registration.eventData;
				const canCancel =
					event &&
					!event.deletedAt &&
					event.eventStatus !== 'FINISHED' &&
					new Date(event.eventStart).getTime() > Date.now() &&
					['PENDING', 'REGISTERED'].includes(registration.participantStatus);
				return (
					<Card key={registration._id} sx={{ p: 2 }}>
						<Stack spacing={1}>
							{event && !event.deletedAt ? (
								<Link href={`/events/detail?id=${registration.eventId}`}>{event.eventTitle}</Link>
							) : (
								<Typography>{event?.eventTitle ?? 'Event unavailable'}</Typography>
							)}
							<Typography>Application: {registration.participantStatus}</Typography>
							{event && (
								<Typography>
									{new Date(event.eventStart).toLocaleString()} · {event.eventStatus}
									{event.deletedAt ? ' · Removed' : ''}
								</Typography>
							)}
							{canCancel && (
								<Button disabled={cancelling} onClick={() => cancelHandler(registration.eventId)}>
									Cancel registration
								</Button>
							)}
						</Stack>
					</Card>
				);
			})}
			<Pagination
				page={page}
				count={Math.max(1, Math.ceil((data?.getMyRegistrations?.metaCounter?.[0]?.total ?? 0) / 10))}
				onChange={(_, value) => setPage(value)}
			/>
		</Stack>
	);
};

export default MyRegistrations;
