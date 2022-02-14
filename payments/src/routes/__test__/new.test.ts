import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { Order } from '../../models/Order';
import { OrderStatusEnum } from '@tytickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/Payment';
// import Stripe from 'stripe';

// jest.mock('../../stripe');

it("returns a 404 when purchasing an order that does not exist.", async () => {
    await request(app)
        .post('/api/payments')
        .set("Cookie", global.signinCookie())
        .send({
            token: "slkfols",
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404)
});



it("returns a 401 when purchasing an order that does not belong to the user.", async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatusEnum.Created
    });
    await order.save()
    await request(app)
        .post('/api/payments')
        .set("Cookie", global.signinCookie())
        .send({
            token: "slkfols",
            orderId: order.id
        })
        .expect(401)
});



it("returns a 400 when purchasing a cancelled order.", async () => {
    const userId = new mongoose.Types.ObjectId().toHexString()
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 20,
        status: OrderStatusEnum.Cancelled
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set("Cookie", global.signinCookie(userId))
        .send({
            token: "slkfols",
            orderId: order.id
        })
        .expect(400)
});



// it("returns a 201 with valid inputs.", async () => {
//     const userId = new mongoose.Types.ObjectId().toHexString()
//     const order = Order.build({
//         id: new mongoose.Types.ObjectId().toHexString(),
//         userId,
//         version: 0,
//         price: 20,
//         status: OrderStatusEnum.Created
//     });
//     await order.save();
//     await request(app)
//         .post('/api/payments')
//         .set("Cookie", global.signinCookie(userId))
//         .send({
//             token: "tok_visa",
//             orderId: order.id
//         })
//         .expect(201);
    
//     const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
//     expect(chargeOptions.source).toEqual("tok_visa")
//     expect(chargeOptions.amount).toEqual(20 * 100)
//     expect(chargeOptions.currency).toEqual("usd")
// });


it("returns a 201 with valid inputs.", async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100)
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price,
        status: OrderStatusEnum.Created
    });
    await order.save();
    await request(app)
        .post('/api/payments')
        .set("Cookie", global.signinCookie(userId))
        .send({
            token: "tok_visa",
            orderId: order.id
        })
        .expect(201);
    const stripeCharges = await stripe.charges.list({ limit: 50 })
    const stripeCharge = stripeCharges.data.find(charge => charge.amount === price * 100);
    expect(stripeCharge).toBeDefined()
    expect(stripeCharge!.currency).toEqual('usd');

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id
    });
    expect(payment).not.toBeNull()
});

