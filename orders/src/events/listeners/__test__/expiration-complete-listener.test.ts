import { natsWrapper } from "../../../nats-wrapper"
import { ExpirationCompleteListener } from "../expiration-complete-listener"
import mongoose from 'mongoose'
import { Ticket } from "../../../models/Tickets";
import { Order } from "../../../models/Order";
import { IExpirationCompleteEvent, OrderStatusEnum } from "@tytickets/common";



const setup = async () => {

    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 34
    });
    await ticket.save();

    const order = Order.build({
        status: OrderStatusEnum.Created,
        userId: "wrer",
        expiresAt: new Date(),
        ticket
    });
    await order.save();

    const data: IExpirationCompleteEvent['data'] = {
        orderId: order.id
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { listener, data, msg, order, ticket }
}



it("updates the order status to cancelled.", async () => {
    const { listener, data, msg, order, ticket } = await setup()
    await listener.onMessage(data, msg)

    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder!.status).toEqual(OrderStatusEnum.Cancelled);
})



it("emits an OrderCancelled Event.", async () => {
    const { listener, data, msg, order, ticket } = await setup()
    await listener.onMessage(data, msg)
    expect(natsWrapper.client.publish).toHaveBeenCalled()

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
    expect(eventData.id).toEqual(order.id)
});



it("acks the message.", async () => {
    const { listener, data, msg, order, ticket } = await setup()
    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})