import { ITicketUpdatedEvent, Publisher, SubjectsEnum } from "@tytickets/common";


export class TicketUpdatedPublisher extends Publisher<ITicketUpdatedEvent> {
   readonly subject = SubjectsEnum.TicketUpdated
}

