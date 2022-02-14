import { IOrderCancelledEvent, IOrderCreatedEvent, OrderStatusEnum } from "@tytickets/common"
import { natsWrapper } from "../../../nats-wrapper"
import mongoose from 'mongoose'
import { Order } from "../../../models/Order"
import { OrderCancelledListener } from "../order-cancelled-listener"


const setup = async () => {

    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client)

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatusEnum.Created,
        price: 10,
        userId: "erer",
        version: 0
    });

    // create a fake data event
    const data: IOrderCancelledEvent['data'] = {
        version: 1,
        id: order.id,
        ticket: {
            id: 'ssfsfsf',
            version: 0
        }
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { listener, data, msg, order }
}



it("updates the order status after cancel.", async () => {
    const { listener, data, msg, order } = await setup();
    await listener.onMessage(data, msg)
    const updatedOrder = await Order.findById(order.id)

    expect(updatedOrder!.status).toEqual(OrderStatusEnum.Cancelled)
})



it("acks the message", async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})