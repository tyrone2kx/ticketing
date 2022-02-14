import { IOrderCreatedEvent, OrderStatusEnum } from "@tytickets/common"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"
import mongoose from 'mongoose'
import { Order } from "../../../models/Order"



const setup = async () => {

    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client)

    // create a fake data event
    const data: IOrderCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: 'wssfs',
        status: OrderStatusEnum.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        ticket: {
            id: 'ssfsfsf',
            price: 39
        }
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { listener, data, msg }
}


it("replicates the order info", async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg)

    const order = await Order.findById(data.id)
    expect(order!.price).toEqual(data.ticket.price)
})


it("acks the message", async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})