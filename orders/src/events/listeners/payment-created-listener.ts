import { IPaymentCreatedEvent, Listener, OrderStatusEnum, SubjectsEnum } from "@tytickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/Order";
import { queueGroupName } from "./queue-group-name";


export class PaymentCreatedListener extends Listener<IPaymentCreatedEvent> {
    readonly subject = SubjectsEnum.PaymentCreated;
    queueGroupName: string = queueGroupName;

    onMessage = async function (data: IPaymentCreatedEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId)
        if (!order) {
            throw new Error("Order not found.")
        }
        order.set({
            status: OrderStatusEnum.Complete
        });
        await order.save();

        // We are not emitting an OrderUpdated Event (due to version number chage) because at this point, the order 
        // cannot be updated again in our application.
        msg.ack();
    }
}