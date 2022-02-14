import { requireAuthMiddleware, validateRequest, NotAuthorizedError, NotFoundError, BadRequestError } from '@tytickets/common'
import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import { Ticket } from '../models/tickets'
import { natsWrapper } from '../nats-wrapper'



const router = express.Router()

router.put('/api/tickets', requireAuthMiddleware, [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required.'),
    body('price')
        .isFloat({ gt: 0 })
        .withMessage('Price must be greater than 0.')
        .not()
        .isEmpty()
        .withMessage('Price is required.')
], validateRequest, async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const { id } = req.params;

    const ticket = await Ticket.findById(id)
    if (!ticket) {
        throw new NotFoundError();
    }
    if (ticket.orderId) {
        throw new BadRequestError("Cannot edit a reserved ticket.")
    }
    if (ticket.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError()
    }
    ticket.set({
        title, price
    })
    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    });

    res.send(ticket)
});


export { router as updateTicketRouter }
