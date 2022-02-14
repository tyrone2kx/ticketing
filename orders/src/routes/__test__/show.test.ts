import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Order, OrderStatusEnum } from '../../models/Order';
import { Ticket } from '../../models/Tickets';


it("fetches the order", async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    });
    await ticket.save()

    const user = global.signinCookie()
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201)

    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .send()
        .expect(200)
    expect(fetchedOrder.id).toEqual(order.id)
});



it("returns an error if one user tries to fetch another user's order.", async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20
    });
    await ticket.save()

    const user = global.signinCookie()
    const user2 = global.signinCookie()
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201)

    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set("Cookie", user2)
        .send()
        .expect(401)
});