import { ITicketUpdatedEvent } from "@tytickets/common"
import mongoose from "mongoose"
import { Message } from 'node-nats-streaming'
import { Ticket } from "../../../models/Tickets"
import { natsWrapper } from "../../../nats-wrapper"
import { TicketUpdatedListener } from "../ticket-updated-listener"


const setup = async () => {

    // create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client)

    // create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 23
    });
    await ticket.save();

    // create a fake data event
    const data: ITicketUpdatedEvent['data'] = {
        version: ticket.version + 1,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Another',
        price: 34,
        userId: new mongoose.Types.ObjectId().toHexString(),
    }
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg, ticket }
}


it('finds, updates and saves a ticket', async () => {
    const { listener, data, msg, ticket } = await setup();
    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket!.title).toEqual(data.title)
    expect(updatedTicket!.price).toEqual(data.price)
    expect(updatedTicket!.version).toEqual(data.version)
});


it('acks the message.', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
});


it('does not call ack() if the event has a skipped version number', async () => {
    const { listener, data, msg } = await setup();
    data.version = 10;
    try {
        await listener.onMessage(data, msg);
    }
    catch (err) {}
    expect(msg.ack).not.toHaveBeenCalled()
});