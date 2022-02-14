import { ITicketCreatedEvent, ITicketUpdatedEvent, Listener, SubjectsEnum } from '@tytickets/common';
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/Tickets';
import { queueGroupName } from './queue-group-name';


export class TicketUpdatedListener extends Listener<ITicketUpdatedEvent> {
    readonly subject = SubjectsEnum.TicketUpdated
    queueGroupName: string = queueGroupName

    onMessage = async function (data: ITicketUpdatedEvent['data'], msg: Message) {
        
        const ticket = await Ticket.findByEvent(data);

        if (!ticket) {
            throw new Error("Ticket not found.")
        }
        const { title, price } = data;
        ticket.set({ title, price })
        await ticket.save();

        msg.ack();
    }
}