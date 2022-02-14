import { Listener } from "./base-listener";
import { Message } from 'node-nats-streaming'
import { ITicketCreatedEvent } from "./ticket-created-event";
import { SubjectsEnum } from "./subjects";



export class TicketCreatedListener extends Listener<ITicketCreatedEvent> {
    readonly subject = SubjectsEnum.TicketCreated
    queueGroupName = 'payments-service'
    onMessage = function (data: ITicketCreatedEvent['data'], msg: Message) {
        console.log("Event data: ", data)
        msg.ack()
    };
}