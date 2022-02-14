import { ITicketCreatedEvent, Listener, SubjectsEnum } from '@tytickets/common';
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/Tickets';
import { queueGroupName } from './queue-group-name';


export class TicketCreatedListener extends Listener<ITicketCreatedEvent> {
    readonly subject = SubjectsEnum.TicketCreated;
    queueGroupName: string = queueGroupName;

    onMessage = async function (data: ITicketCreatedEvent['data'], msg: Message) {
        const { title, price, id } = data;
        const ticket = Ticket.build({
            title, price, id
        });
        await ticket.save();
        msg.ack();
    }
}