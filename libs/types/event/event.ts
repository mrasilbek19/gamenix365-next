import { EventType, EventStatus, ParticipantStatus } from '../../enums/event.enum';
export interface GamingEvent {
	_id: string;
	eventType: EventType;
	eventStatus: EventStatus;
	eventTitle: string;
	eventDesc: string;
	eventGame: string;
	eventImage: string;
	eventDate: string;
	eventMaxParticipants: number;
	eventOrganizer: string;
	eventStart: string;
	eventEnd: string;
	eventPrize: string;
	deletedAt?: string | null;
}
export interface EventInput extends Omit<GamingEvent, '_id' | 'eventOrganizer' | 'deletedAt'> {}
export interface EventParticipant {
	_id: string;
	eventId: string;
	memberId: string;
	participantStatus: ParticipantStatus;
	eventData?: GamingEvent;
	memberData?: { _id: string; memberNick: string; memberImage?: string; memberStatus: string };
}
