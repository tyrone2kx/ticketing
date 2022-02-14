import { IExpirationCompleteEvent, Listener, OrderStatusEnum, SubjectsEnum } from "@tytickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/Order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { queueGroupName } from "./queue-group-name";


export class ExpirationCompleteListener extends Listener<IExpirationCompleteEvent> {
    readonly subject = SubjectsEnum.ExpirationComplete
    queueGroupName: string = queueGroupName

    onMessage = async function(data: IExpirationCompleteEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId).populate('ticket');

        if(!order) {
            throw new Error("Order not found")
        }

        if (order.status === OrderStatusEnum.Complete) {
            return msg.ack()
        }

        order.set({status: OrderStatusEnum.Cancelled})
        await order.save();

        // @ts-ignore
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
                version: order.ticket.version,
            }
        });
        msg.ack();
    }
}