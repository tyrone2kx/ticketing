import { requireAuthMiddleware } from '@tytickets/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/Order';


const router = express.Router();

router.get('/api/orders', requireAuthMiddleware, async (req: Request, res: Response) => {
    const orders = Order.find({ userId: req.currentUser!.id }).populate('ticket')
    res.send(orders)
})


export { router as indexOrderRouter }