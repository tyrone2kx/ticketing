import { Publisher } from "./base-publisher";
import { SubjectsEnum } from "./subjects";
import { ITicketCreatedEvent } from "./ticket-created-event";



export class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent> {
    readonly subject = SubjectsEnum.TicketCreated
}