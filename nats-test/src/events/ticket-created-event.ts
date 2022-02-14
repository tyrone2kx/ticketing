import { SubjectsEnum } from "./subjects";


export interface ITicketCreatedEvent {
    subject: SubjectsEnum.TicketCreated,
    data: {
        id: string;
        title: string;
        price: number;
    }
}