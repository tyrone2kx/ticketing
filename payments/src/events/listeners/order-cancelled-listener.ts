import { IOrderCancelledEvent, Listener, OrderStatusEnum, SubjectsEnum } from "@tytickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/Order";
import { queueGroupName } from "./queue-group-name";



export class OrderCancelledListener extends Listener<IOrderCancelledEvent> {
    readonly subject = SubjectsEnum.OrderCancelled;
    queueGroupName: string = queueGroupName;

    onMessage = async function (data: IOrderCancelledEvent['data'], msg: Message) {
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1
        });

        if(!order) {
            throw new Error("Order not found.")
        }
        order.set({ status: OrderStatusEnum.Cancelled })
        await order.save();
        msg.ack();
    }
}