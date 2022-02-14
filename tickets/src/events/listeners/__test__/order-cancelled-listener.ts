import { Ticket } from "../../../models/tickets";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"
import mongoose from 'mongoose'
import { IOrderCancelledEvent } from "@tytickets/common";
import {Message} from 'node-nats-streaming';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: "concert",
        price: 30,
        userId: '2324dsdf'
    });
    ticket.set({ orderId });
    await ticket.save();

    const data: IOrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
            version: ticket.version
        }
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { msg, data, ticket, orderId, listener }
}


it("updates the ticket, publishes an event, and acks the message", async () => {
    const { msg, data, ticket, orderId, listener } = await setup()
    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined()
    expect(msg.ack).toHaveBeenCalled()
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})