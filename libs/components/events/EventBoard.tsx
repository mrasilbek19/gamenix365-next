import React, { useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Card, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_EVENTS, GET_MY_EVENTS } from '../../../apollo/user/query';
import { CREATE_EVENT, UPDATE_EVENT, FINISH_EVENT, REMOVE_EVENT } from '../../../apollo/user/mutation';
import { GET_ALL_EVENTS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_EVENT_BY_ADMIN, REMOVE_EVENT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { EventInput, GamingEvent } from '../../types/event/event';
import { EventStatus, EventType } from '../../enums/event.enum';
import { imageUrl, uploadImages } from '../../uploads';
import { sweetConfirmAlert } from '../../sweetAlert';

const initialValues: EventInput = {
	eventTitle: '',
	eventDesc: '',
	eventGame: '',
	eventImage: '',
	eventPrize: '',
	eventType: EventType.TOURNAMENT,
	eventStatus: EventStatus.PAUSED,
	eventDate: '',
	eventStart: '',
	eventEnd: '',
	eventMaxParticipants: 1,
};

const EventBoard = ({ mode = 'public' }: { mode?: 'public' | 'shop' | 'admin' }) => {
	const user = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const [type, setType] = useState('');
	const [status, setStatus] = useState('');
	const [message, setMessage] = useState('');
	const [form, setForm] = useState<EventInput>(initialValues);
	const [editing, setEditing] = useState<GamingEvent | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [uploading, setUploading] = useState(false);
	const allowed =
		mode === 'public' || (user.memberStatus === 'ACTIVE' && user.memberType === (mode === 'shop' ? 'SHOP' : 'ADMIN'));

	/** APOLLO REQUESTS **/
	const query = mode === 'shop' ? GET_MY_EVENTS : mode === 'admin' ? GET_ALL_EVENTS_BY_ADMIN : GET_EVENTS;
	const field = mode === 'shop' ? 'getMyEvents' : mode === 'admin' ? 'getAllEventsByAdmin' : 'getEvents';
	const { data, loading, error, refetch } = useQuery(query, {
		variables: {
			input: {
				page,
				limit: 6,
				search: { ...(type ? { eventType: type } : {}), ...(status ? { eventStatus: status } : {}) },
			},
		},
		skip: !allowed,
		fetchPolicy: 'network-only',
	});
	const [createEvent, { loading: creating }] = useMutation(CREATE_EVENT);
	const [updateEvent, { loading: updating }] = useMutation(mode === 'admin' ? UPDATE_EVENT_BY_ADMIN : UPDATE_EVENT);
	const [finishEvent, { loading: finishing }] = useMutation(FINISH_EVENT);
	const [removeEvent, { loading: removing }] = useMutation(mode === 'admin' ? REMOVE_EVENT_BY_ADMIN : REMOVE_EVENT);
	const busy = creating || updating || finishing || removing || uploading;
	const events: GamingEvent[] = data?.[field]?.list ?? [];

	/** HANDLERS **/
	const editEventHandler = (event: GamingEvent) => {
		const values = { ...initialValues };
		for (const key of Object.keys(values) as (keyof EventInput)[]) {
			Object.assign(values, { [key]: event[key] });
		}
		for (const key of ['eventDate', 'eventStart', 'eventEnd'] as const) {
			const date = new Date(event[key]);
			values[key] = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, -1);
		}
		setForm(values);
		setEditing(event);
		setShowForm(true);
		setMessage('');
	};

	const saveEventHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setMessage('');
			const start = new Date(form.eventStart);
			if (start >= new Date(form.eventEnd)) throw new Error('Start must be before end.');
			if ((!editing || start.getTime() !== new Date(editing.eventStart).getTime()) && start.getTime() <= Date.now())
				throw new Error('Start must be in the future.');
			const input: Partial<EventInput> = {
				...form,
				eventDate: new Date(form.eventDate).toISOString(),
				eventStart: start.toISOString(),
				eventEnd: new Date(form.eventEnd).toISOString(),
			};
			if (editing) {
				if (start.getTime() === new Date(editing.eventStart).getTime()) delete input.eventStart;
				await updateEvent({ variables: { input: { ...input, _id: editing._id } } });
			} else {
				await createEvent({ variables: { input } });
			}
			setShowForm(false);
			setEditing(null);
			await refetch();
		} catch (err: any) {
			setMessage(err.message);
		}
	};

	const changeEventHandler = async (event: GamingEvent, action: string) => {
		try {
			if (!(await sweetConfirmAlert(`${action} this event?`))) return;
			setMessage('');
			if (action === 'Remove') await removeEvent({ variables: { input: event._id } });
			else if (action === 'Finish' && mode === 'shop') await finishEvent({ variables: { input: event._id } });
			else
				await updateEvent({
					variables: {
						input: {
							_id: event._id,
							eventStatus:
								action === 'Finish'
									? EventStatus.FINISHED
									: event.eventStatus === EventStatus.PROCESS
									? EventStatus.PAUSED
									: EventStatus.PROCESS,
						},
					},
				});
			await refetch();
		} catch (err: any) {
			setMessage(err.message);
		}
	};

	if (!allowed)
		return (
			<Alert severity="info">
				Log in with an active {mode === 'shop' ? 'shop' : 'admin'} account to manage events.
			</Alert>
		);

	return (
		<Stack spacing={3} sx={{ p: { xs: 2, md: 4 }, width: '100%', maxWidth: 1200, mx: 'auto' }}>
			<Typography variant="h4">
				{mode === 'public' ? 'Gaming Events' : mode === 'shop' ? 'My Events' : 'Manage Events'}
			</Typography>
			<Stack direction="row" spacing={2} flexWrap="wrap">
				<Link href="/events">All events</Link>
				{user.memberType === 'SHOP' && <Link href="/events/manage">My events</Link>}
				{user.memberType === 'USER' && <Link href="/events/registrations">My registrations</Link>}
				{user.memberType === 'ADMIN' && <Link href="/_admin/events">Manage events</Link>}
				{mode === 'shop' && (
					<Button
						disabled={busy}
						onClick={() => {
							setForm(initialValues);
							setEditing(null);
							setShowForm(true);
						}}
					>
						Create event
					</Button>
				)}
			</Stack>
			{message && <Alert severity="error">{message}</Alert>}
			{showForm && (
				<Stack component="form" spacing={2} onSubmit={saveEventHandler}>
					<Typography variant="h6">{editing ? 'Edit event' : 'Create event'}</Typography>
					{(['eventTitle', 'eventGame', 'eventPrize', 'eventDesc'] as const).map((key) => (
						<TextField
							key={key}
							required
							label={{ eventTitle: 'Title', eventGame: 'Game', eventPrize: 'Prize', eventDesc: 'Description' }[key]}
							value={form[key]}
							multiline={key === 'eventDesc'}
							onChange={(e) => setForm({ ...form, [key]: e.target.value })}
						/>
					))}
					<TextField
						select
						label="Type"
						value={form.eventType}
						onChange={(e) => setForm({ ...form, eventType: e.target.value as EventType })}
					>
						{Object.values(EventType).map((value) => (
							<MenuItem key={value} value={value}>
								{value}
							</MenuItem>
						))}
					</TextField>
					<TextField
						select
						label="Status"
						value={form.eventStatus}
						onChange={(e) => setForm({ ...form, eventStatus: e.target.value as EventStatus })}
					>
						{[EventStatus.PAUSED, EventStatus.PROCESS].map((value) => (
							<MenuItem key={value} value={value}>
								{value}
							</MenuItem>
						))}
					</TextField>
					{(['eventDate', 'eventStart', 'eventEnd'] as const).map((key) => (
						<TextField
							key={key}
							required
							type="datetime-local"
							inputProps={{ step: 'any' }}
							label={{ eventDate: 'Scheduled date', eventStart: 'Start', eventEnd: 'End' }[key]}
							InputLabelProps={{ shrink: true }}
							value={form[key]}
							onChange={(e) => setForm({ ...form, [key]: e.target.value })}
						/>
					))}
					<TextField
						required
						type="number"
						label="Maximum participants"
						inputProps={{ min: 1, step: 1 }}
						value={form.eventMaxParticipants}
						onChange={(e) => setForm({ ...form, eventMaxParticipants: Number(e.target.value) })}
					/>
					<Button component="label" disabled={busy}>
						{uploading ? 'Uploading...' : 'Upload event image'}
						<input
							hidden
							type="file"
							accept="image/jpeg,image/png"
							onChange={async (e) => {
								const file = e.target.files?.[0];
								if (!file) return;
								setUploading(true);
								try {
									const images = await uploadImages([file], 'event');
									setForm((current) => ({ ...current, eventImage: images[0] }));
								} catch (err: any) {
									setMessage(err.message);
								} finally {
									setUploading(false);
								}
							}}
						/>
					</Button>
					{form.eventImage && (
						<img
							src={imageUrl(form.eventImage)}
							alt="Event preview"
							style={{ maxWidth: 240, maxHeight: 160, objectFit: 'contain' }}
						/>
					)}
					<Stack direction="row" spacing={2}>
						<Button type="submit" variant="contained" disabled={busy || !form.eventImage}>
							{busy ? 'Saving...' : 'Save event'}
						</Button>
						<Button disabled={busy} onClick={() => setShowForm(false)}>
							Cancel
						</Button>
					</Stack>
				</Stack>
			)}
			<Stack direction="row" spacing={2}>
				<TextField
					select
					label="Type"
					value={type}
					onChange={(e) => {
						setType(e.target.value);
						setPage(1);
					}}
					sx={{ minWidth: 160 }}
				>
					<MenuItem value="">All types</MenuItem>
					{Object.values(EventType).map((value) => (
						<MenuItem key={value} value={value}>
							{value}
						</MenuItem>
					))}
				</TextField>
				<TextField
					select
					label="Status"
					value={status}
					onChange={(e) => {
						setStatus(e.target.value);
						setPage(1);
					}}
					sx={{ minWidth: 160 }}
				>
					<MenuItem value="">All statuses</MenuItem>
					{Object.values(EventStatus).map((value) => (
						<MenuItem key={value} value={value}>
							{value}
						</MenuItem>
					))}
				</TextField>
			</Stack>
			{loading && <Typography>Loading events...</Typography>}
			{error && <Alert severity="error">{error.message}</Alert>}
			{!loading && !error && !events.length && <Typography>No events found.</Typography>}
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24 }}>
				{events.map((event) => (
					<Card key={event._id} sx={{ p: 2 }}>
						<Stack spacing={2}>
							<img
								src={imageUrl(event.eventImage)}
								alt={event.eventTitle}
								style={{ width: '100%', height: 180, objectFit: 'cover' }}
							/>
							<Link href={`/events/detail?id=${event._id}`}>
								<Typography variant="h6">{event.eventTitle}</Typography>
							</Link>
							<Typography>
								{event.eventType} · {event.eventGame} · {event.eventStatus}
							</Typography>
							<Typography>{new Date(event.eventStart).toLocaleString()}</Typography>
							<Typography>Prize: {event.eventPrize}</Typography>
							{mode !== 'public' && (
								<Stack direction="row" flexWrap="wrap">
									{event.eventStatus !== EventStatus.FINISHED && (
										<>
											<Button disabled={busy} onClick={() => editEventHandler(event)}>
												Edit
											</Button>
											<Button
												disabled={
													busy ||
													(event.eventStatus === EventStatus.PAUSED &&
														new Date(event.eventStart).getTime() <= Date.now())
												}
												onClick={() =>
													changeEventHandler(event, event.eventStatus === EventStatus.PROCESS ? 'Pause' : 'Activate')
												}
											>
												{event.eventStatus === EventStatus.PROCESS ? 'Pause' : 'Activate'}
											</Button>
											<Button disabled={busy} onClick={() => changeEventHandler(event, 'Finish')}>
												Finish
											</Button>
										</>
									)}
									<Button disabled={busy} onClick={() => changeEventHandler(event, 'Remove')}>
										Remove
									</Button>
								</Stack>
							)}
						</Stack>
					</Card>
				))}
			</div>
			<Pagination
				page={page}
				count={Math.max(1, Math.ceil((data?.[field]?.metaCounter?.[0]?.total ?? 0) / 6))}
				onChange={(_, value) => setPage(value)}
			/>
		</Stack>
	);
};

export default EventBoard;
