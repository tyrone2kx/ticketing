import request from 'supertest'
import { app } from '../../app'
import { Order, OrderStatusEnum } from '../../models/Order';
import { Ticket } from '../../models/Tickets';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose'

it('marks an order as cancelled', async () => {
    // create a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    });
    await ticket.save()

    const user = global.signinCookie()

    // make a request to create an order
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201)


    // cancel the created order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204)


    // expect that the order is cancelled.
    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder!.status).toEqual(OrderStatusEnum.Cancelled)
});


it("emits an order cancelled event.", async () => {
    // create a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    });
    await ticket.save()
    const user = global.signinCookie()
    // make a request to create an order
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201)

    // cancel the created order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})