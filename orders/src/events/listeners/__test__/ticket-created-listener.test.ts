import { ITicketCreatedEvent } from "@tytickets/common"
import mongoose from "mongoose"
import { Message } from 'node-nats-streaming'
import { Ticket } from "../../../models/Tickets"
import { natsWrapper } from "../../../nats-wrapper"
import { TicketCreatedListener } from "../ticket-created-listener"


const setup = async () => {

    // create an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client)
    // create a fake data event
    const data: ITicketCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 23,
        userId: new mongoose.Types.ObjectId().toHexString(),
    }
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { listener, data, msg }
}

it('creates and saves a ticket', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // write assertions to make sure a ticket was created.
    const ticket = await Ticket.findById(data.id)

    expect(ticket).toBeDefined()
    expect(ticket!.title).toEqual(data.title)
    expect(ticket!.price).toEqual(data.price)
})


it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // write assertions to make sure ack was called.
    expect(msg.ack).toHaveBeenCalled()

})