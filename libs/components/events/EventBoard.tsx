import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Card, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDateFns } from '@mui/x-date-pickers-pro/AdapterDateFns';
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
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

const initialValues: EventInput = {
	eventTitle: '',
	eventDesc: '',
	eventGame: '',
	eventImage: '',
	eventPrize: '',
	eventType: EventType.TOURNAMENT,
	eventStatus: EventStatus.PENDING,
	eventDate: '',
	eventStart: '',
	eventEnd: '',
	eventMaxParticipants: 1,
};

const EventBoard = ({
	mode = 'public',
	showCreateForm = false,
}: {
	mode?: 'public' | 'shop' | 'admin';
	showCreateForm?: boolean;
}) => {
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
				search: {
					...(type ? { eventType: type } : {}),
					...(mode === 'public' ? { eventStatus: EventStatus.PROCESS } : status ? { eventStatus: status } : {}),
				},
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
	const startDate = new Date(form.eventStart);
	const requireFutureStart =
		!editing ||
		startDate.getTime() !== new Date(editing.eventStart).getTime() ||
		(form.eventStatus === EventStatus.PROCESS && editing.eventStatus !== EventStatus.PROCESS);

	/** LIFECYCLES **/
	useEffect(() => {
		if (mode === 'shop') {
			setForm(initialValues);
			setEditing(null);
			setShowForm(showCreateForm);
		}
	}, [showCreateForm]);

	/** HANDLERS **/
	const editEventHandler = (event: GamingEvent) => {
		const values = { ...initialValues };
		for (const key of Object.keys(values) as (keyof EventInput)[]) {
			Object.assign(values, { [key]: event[key] });
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
			if (
				(['eventDate', 'eventStart', 'eventEnd'] as const).some(
					(key) => !form[key] || Number.isNaN(new Date(form[key]).getTime()),
				)
			)
				throw new Error('Choose a valid scheduled date, start and end time.');
			const start = new Date(form.eventStart);
			if (start >= new Date(form.eventEnd)) throw new Error('Start must be before end.');
			if (requireFutureStart && start.getTime() <= Date.now()) throw new Error('Start must be in the future.');
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
		<Stack
			className={`event-board ${mode === 'public' ? 'event-board-public' : ''}`}
			spacing={3}
			sx={{ p: { xs: 2, md: 4 }, width: '100%', maxWidth: 1200, mx: 'auto' }}
		>
			{mode !== 'public' && <Typography variant="h4">{mode === 'shop' ? 'My Events' : 'Manage Events'}</Typography>}
			<Stack className={'event-navigation'} direction="row" spacing={2} flexWrap="wrap">
				<Link href="/events" aria-current={mode === 'public' ? 'page' : undefined}>
					All events
				</Link>
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
					{mode === 'shop' && form.eventStatus === EventStatus.PENDING && (
						<Alert severity="info">Your event will be visible after an admin approves it.</Alert>
					)}
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
					{(mode !== 'shop' ||
						(editing && [EventStatus.PAUSED, EventStatus.PROCESS].includes(editing.eventStatus))) && (
						<TextField
							select
							label="Status"
							value={form.eventStatus}
							onChange={(e) => setForm({ ...form, eventStatus: e.target.value as EventStatus })}
						>
							{(mode === 'admin'
								? [EventStatus.PENDING, EventStatus.PAUSED, EventStatus.PROCESS]
								: [EventStatus.PAUSED, EventStatus.PROCESS]
							).map((value) => (
								<MenuItem key={value} value={value}>
									{value}
								</MenuItem>
							))}
						</TextField>
					)}
					<LocalizationProvider dateAdapter={AdapterDateFns}>
						<Typography variant="subtitle1">Event schedule</Typography>
						<Typography variant="body2" color="text.secondary">
							Times use your local time zone ({Intl.DateTimeFormat().resolvedOptions().timeZone}). Use 24-hour time.
						</Typography>
						<Stack
							sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}
						>
							{(['eventDate', 'eventStart', 'eventEnd'] as const).map((key) => (
								<DateTimePicker
									key={key}
									label={{ eventDate: 'Scheduled date', eventStart: 'Start', eventEnd: 'End' }[key]}
									value={form[key] ? new Date(form[key]) : null}
									inputFormat="yyyy-MM-dd HH:mm"
									ampm={false}
									showToolbar
									hideTabs={false}
									desktopModeMediaQuery="(min-width: 700px)"
									minDateTime={
										key === 'eventStart' && requireFutureStart
											? new Date()
											: key === 'eventEnd' && !Number.isNaN(startDate.getTime())
											? new Date(startDate.getTime() + 1)
											: undefined
									}
									onChange={(date: Date | null) => {
										const value = date && !Number.isNaN(date.getTime()) ? date.toISOString() : date?.toString() || '';
										setForm({ ...form, [key]: value });
									}}
									componentsProps={{ actionBar: { actions: ['cancel', 'accept'] } }}
									renderInput={(params) => (
										<TextField
											{...params}
											required
											fullWidth
											helperText={
												params.error
													? {
															eventDate: 'Choose a valid scheduled date and time.',
															eventStart: 'Choose a valid start time in the future.',
															eventEnd: 'Choose a valid end time after the start.',
													  }[key]
													: {
															eventDate: 'The scheduled date of your event.',
															eventStart: 'The event begins and applications close.',
															eventEnd: 'The event ends. Must be after the start.',
													  }[key]
											}
										/>
									)}
								/>
							))}
						</Stack>
					</LocalizationProvider>
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
			<Stack
				className={'event-list-toolbar'}
				direction="row"
				spacing={mode === 'shop' ? 0 : 2}
				justifyContent="flex-end"
				role={mode === 'shop' ? 'group' : undefined}
				aria-label={mode === 'shop' ? 'Event list filters' : undefined}
			>
				{mode === 'shop' && (
					<Stack className={'event-list-title'}>
						<Typography component="h2">Your events</Typography>
						<Typography>Filter the list by type or status.</Typography>
					</Stack>
				)}
				<TextField
					className={'event-list-filter'}
					select
					label={mode === 'shop' ? 'Filter by type' : mode === 'public' ? 'Event type' : 'Type'}
					size={mode !== 'admin' ? 'small' : undefined}
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
							{mode === 'public' ? { TOURNAMENT: 'Tournament', GIVEAWAY: 'Giveaway' }[value] : value}
						</MenuItem>
					))}
				</TextField>
				{mode !== 'public' && (
					<TextField
						className={'event-list-filter'}
						select
						label={mode === 'shop' ? 'Filter by status' : 'Status'}
						size={mode === 'shop' ? 'small' : undefined}
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
				)}
			</Stack>
			{loading && (
				<Typography className={'event-list-message'} role={'status'}>
					Loading events...
				</Typography>
			)}
			{error && <Alert severity="error">{error.message}</Alert>}
			{!loading &&
				!error &&
				!events.length &&
				(mode === 'public' ? (
					<Stack className={'event-empty-state'}>
						<CalendarTodayOutlinedIcon />
						<Typography variant={'h6'}>No events found</Typography>
						<Typography>Try another event type or check back for upcoming community events.</Typography>
					</Stack>
				) : (
					<Typography>No events found.</Typography>
				))}
			<div
				className={'event-list'}
				style={
					mode === 'admin'
						? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24 }
						: undefined
				}
			>
				{events.map((event) => (
					<Card className={'event-card'} key={event._id} sx={{ p: 2 }}>
						{mode === 'public' ? (
							<Link className={'event-card-link'} href={`/events/detail?id=${event._id}`}>
								<div className={'event-image-wrap'}>
									<img
										className={'event-image'}
										src={imageUrl(event.eventImage)}
										alt={event.eventTitle}
										loading="lazy"
									/>
								</div>
								<Stack className={'event-card-body'}>
									<Stack className={'event-card-heading'} direction={'row'}>
										<Typography className={'event-type'}>
											{{ TOURNAMENT: 'Tournament', GIVEAWAY: 'Giveaway' }[event.eventType]}
										</Typography>
										<Typography className={'event-status'}>
											{
												{ PENDING: 'Pending approval', PAUSED: 'Paused', PROCESS: 'Active', FINISHED: 'Finished' }[
													event.eventStatus
												]
											}
										</Typography>
									</Stack>
									<Typography className={'event-title'} component={'h2'}>
										{event.eventTitle}
									</Typography>
									<Typography className={'event-game'}>{event.eventGame}</Typography>
									<Stack className={'event-card-details'}>
										<Stack className={'event-meta-row'} direction={'row'}>
											<CalendarTodayOutlinedIcon />
											<Stack>
												<Typography component={'time'} dateTime={event.eventDate}>
													{new Date(event.eventDate).toLocaleDateString(undefined, {
														month: 'short',
														day: 'numeric',
														year: 'numeric',
													})}
												</Typography>
												<Typography className={'event-time'}>
													<time dateTime={event.eventStart}>
														{new Date(event.eventStart).toLocaleString(undefined, {
															month: 'short',
															day: 'numeric',
															hour: 'numeric',
															minute: '2-digit',
														})}
													</time>
													{' – '}
													<time dateTime={event.eventEnd}>
														{new Date(event.eventEnd).toLocaleString(undefined, {
															month: 'short',
															day: 'numeric',
															hour: 'numeric',
															minute: '2-digit',
														})}
													</time>
												</Typography>
											</Stack>
										</Stack>
										<Stack className={'event-meta-row'} direction={'row'}>
											<PeopleOutlineRoundedIcon />
											<Typography>Capacity: {event.eventMaxParticipants} participants</Typography>
										</Stack>
									</Stack>
									<Stack className={'event-card-footer'} direction={'row'}>
										{event.eventPrize && (
											<Typography className={'event-prize'}>
												<EmojiEventsOutlinedIcon />
												Prize: {event.eventPrize}
											</Typography>
										)}
										<span className={'view-event'}>
											View Event <ArrowForwardRoundedIcon />
										</span>
									</Stack>
								</Stack>
							</Link>
						) : (
							<Stack className={'event-card-content'} spacing={mode === 'shop' ? 0 : 2}>
								<img
									className={'event-image'}
									src={imageUrl(event.eventImage)}
									alt={event.eventTitle}
									style={mode === 'shop' ? undefined : { width: '100%', height: 180, objectFit: 'cover' }}
								/>
								{mode === 'shop' && (
									<Stack className={'event-card-heading'} direction="row">
										<Typography className={'event-type'}>{event.eventType}</Typography>
										<Typography className={'event-status'}>{event.eventStatus}</Typography>
									</Stack>
								)}
								{event.eventStatus === EventStatus.PROCESS ? (
									<Link href={`/events/detail?id=${event._id}`}>
										<Typography className={'event-title'} variant="h6">
											{event.eventTitle}
										</Typography>
									</Link>
								) : (
									<Typography className={'event-title'} variant="h6">
										{event.eventTitle}
									</Typography>
								)}
								{mode === 'shop' ? (
									<>
										<Typography className={'event-game'}>{event.eventGame}</Typography>
										<Stack className={'event-card-details'}>
											{(['eventDate', 'eventStart', 'eventEnd'] as const).map((key) => (
												<Typography className={'event-info-row'} key={key}>
													<span>{{ eventDate: 'Scheduled', eventStart: 'Start', eventEnd: 'End' }[key]}</span>
													<time dateTime={event[key]}>{new Date(event[key]).toLocaleString()}</time>
												</Typography>
											))}
											<Typography className={'event-info-row'}>
												<span>Participant limit</span>
												<strong>{event.eventMaxParticipants}</strong>
											</Typography>
										</Stack>
									</>
								) : (
									<>
										<Typography>
											{event.eventType} · {event.eventGame} · {event.eventStatus}
										</Typography>
										<Typography>{new Date(event.eventStart).toLocaleString()}</Typography>
									</>
								)}
								<Typography className={'event-prize'}>Prize: {event.eventPrize}</Typography>
								<Stack className={'event-actions'} direction="row" flexWrap="wrap">
									{event.eventStatus !== EventStatus.FINISHED && (
										<>
											<Button disabled={busy} onClick={() => editEventHandler(event)}>
												Edit
											</Button>
											{(mode === 'admin' || [EventStatus.PAUSED, EventStatus.PROCESS].includes(event.eventStatus)) && (
												<>
													<Button
														disabled={
															busy ||
															(event.eventStatus !== EventStatus.PROCESS &&
																new Date(event.eventStart).getTime() <= Date.now())
														}
														onClick={() =>
															changeEventHandler(
																event,
																event.eventStatus === EventStatus.PENDING
																	? 'Approve'
																	: event.eventStatus === EventStatus.PROCESS
																	? 'Pause'
																	: 'Activate',
															)
														}
													>
														{event.eventStatus === EventStatus.PENDING
															? 'Approve'
															: event.eventStatus === EventStatus.PROCESS
															? 'Pause'
															: 'Activate'}
													</Button>
													{event.eventStatus !== EventStatus.PENDING && (
														<Button disabled={busy} onClick={() => changeEventHandler(event, 'Finish')}>
															Finish
														</Button>
													)}
												</>
											)}
										</>
									)}
									<Button disabled={busy} onClick={() => changeEventHandler(event, 'Remove')}>
										Remove
									</Button>
								</Stack>
							</Stack>
						)}
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
