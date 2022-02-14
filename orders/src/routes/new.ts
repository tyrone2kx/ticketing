import { BadRequestError, NotFoundError, OrderStatusEnum, requireAuthMiddleware, validateRequest } from '@tytickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator'
import mongoose from 'mongoose'
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { Order } from '../models/Order';
import { Ticket } from '../models/Tickets';
import { natsWrapper } from '../nats-wrapper';


const router = express.Router();


const EXPIRATION_WINDOW_SECONDS = 15 * 60

router.post('/api/orders', requireAuthMiddleware, [
    body('ticketId')
        .not()
        .isEmpty()
        // The below line shouldn't be used because the tickets service db could be changed. 
        // .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('Ticket ID must be provided.')
], validateRequest, async (req: Request, res: Response) => {
    const { ticketId } = req.body

    // Find the ticket the user is trying to order in the db.
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new NotFoundError();
    }

    // Make sure the ticket is not already reserved.
        // Run query to look at all orders. Find an order where the ticket is the same ticket we found
        // and the orders status is not cancelled. This means the ticket is reserved.
    
    const isReserved = await ticket.isReserved()
    if (isReserved) {
        throw new BadRequestError("This ticket is already reserved.")
    }

    // Calculate an expiration date for the order.

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    // Build the order and save it in the db.
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatusEnum.Created,
        expiresAt: expiration,
        ticket
    })
    await order.save();

    // Publish an event saying that an order was created.
    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        version: order.version,
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    })

    res.status(201).send(order)
})


export { router as newOrderRouter }