import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/tickets'
import { natsWrapper } from '../../nats-wrapper'



it("returns a 404 if the provided id does not exist", async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signinCookie())
        .send({ title: 'sdsfsf', price: 23 })
        .expect(404)
})

it("returns a 401 if the user is not signed in.", async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({ title: 'sdsfsf', price: 23 })
        .expect(401)
})

it("returns a 401 if the user does not own the ticket", async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signinCookie())
        .send({
            title: "Wizzy show",
            price: 90
        })
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signinCookie())
        .send({
            title: "Lix show",
            price: 23
        })
        .expect(401)
})

it("returns a 400 if the user provides an invalid title or price", async () => {
    const cookie = global.signinCookie()
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: "Wizzy show",
            price: 90
        })
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "",
            price: 23
        })
        .expect(400)
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "asasad",
            price: ""
        })
        .expect(400)
})




it("updates the ticket provided inputs are valid", async () => {
    const cookie = global.signinCookie()
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: "Wizzy show",
            price: 90
        })
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "A new title",
            price: 23
        })
        .expect(200)
    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send()
    expect(ticketResponse.body.title).toEqual("A new title")
    expect(ticketResponse.body.price).toEqual(23)
})



it("publishes an event.", async () => {
    const cookie = global.signinCookie()
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: "Wizzy show",
            price: 90
        })
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "A new title",
            price: 23
        })
        .expect(200)
    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send()

    expect(natsWrapper.client.publish).toHaveBeenCalled()
});




it("rejects updates if the ticket is reserved", async () => {
    const cookie = global.signinCookie()
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: "Wizzy show",
            price: 90
        })
    const ticket = await Ticket.findById(response.body.id)
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() })
    await ticket!.save()

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "A new title",
            price: 23
        })
        .expect(400)
});