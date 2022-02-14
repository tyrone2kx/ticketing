import { ITicketCreatedEvent, Publisher, SubjectsEnum } from "@tytickets/common";


export class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent> {
   readonly subject = SubjectsEnum.TicketCreated
}

