import React, { useState } from 'react';
import {
	Alert,
	Button,
	MenuItem,
	Pagination,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_EVENT_PARTICIPANTS } from '../../../apollo/user/query';
import { UPDATE_EVENT_PARTICIPANT } from '../../../apollo/user/mutation';
import { EventParticipant, GamingEvent } from '../../types/event/event';
import { ParticipantStatus } from '../../enums/event.enum';

const Participants = ({ event }: { event: GamingEvent }) => {
	const user = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState('');
	const [message, setMessage] = useState('');
	const allowed =
		user.memberStatus === 'ACTIVE' &&
		(user.memberType === 'ADMIN' || (user.memberType === 'SHOP' && user._id === event.eventOrganizer));
	const closed =
		!!event.deletedAt || event.eventStatus === 'FINISHED' || new Date(event.eventStart).getTime() <= Date.now();

	/** APOLLO REQUESTS **/
	const { data, loading, error, refetch } = useQuery(GET_EVENT_PARTICIPANTS, {
		variables: { eventId: event._id, input: { page, limit: 10, search: status ? { participantStatus: status } : {} } },
		skip: !allowed,
		fetchPolicy: 'network-only',
	});
	const [updateParticipant, { loading: updating }] = useMutation(UPDATE_EVENT_PARTICIPANT);
	const participants: EventParticipant[] = data?.getEventParticipants?.list ?? [];

	/** HANDLERS **/
	const reviewHandler = async (id: string, participantStatus: ParticipantStatus) => {
		try {
			setMessage('');
			await updateParticipant({ variables: { input: { _id: id, participantStatus } } });
			await refetch();
		} catch (err: any) {
			setMessage(err.message);
		}
	};

	if (!allowed) return null;
	return (
		<Stack spacing={2}>
			<Typography variant="h5">Participants</Typography>
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
			{loading ? (
				<Typography>Loading participants...</Typography>
			) : (
				<div style={{ overflowX: 'auto' }}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Member</TableCell>
								<TableCell>Status</TableCell>
								<TableCell>Review</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{participants.map((participant) => (
								<TableRow key={participant._id}>
									<TableCell>{participant.memberData?.memberNick ?? participant.memberId}</TableCell>
									<TableCell>{participant.participantStatus}</TableCell>
									<TableCell>
										{participant.participantStatus === ParticipantStatus.PENDING && (
											<>
												<Button
													disabled={updating || closed}
													onClick={() => reviewHandler(participant._id, ParticipantStatus.REGISTERED)}
												>
													Approve
												</Button>
												<Button
													disabled={updating || closed}
													onClick={() => reviewHandler(participant._id, ParticipantStatus.REJECTED)}
												>
													Reject
												</Button>
											</>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
			{!loading && !error && !participants.length && <Typography>No participants found.</Typography>}
			<Pagination
				page={page}
				count={Math.max(1, Math.ceil((data?.getEventParticipants?.metaCounter?.[0]?.total ?? 0) / 10))}
				onChange={(_, value) => setPage(value)}
			/>
		</Stack>
	);
};

export default Participants;
