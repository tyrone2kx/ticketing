import { IOrderCreatedEvent, Listener, SubjectsEnum } from "@tytickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/Order";
import { queueGroupName } from "./queue-group-name";



export class OrderCreatedListener extends Listener<IOrderCreatedEvent> {
    readonly subject = SubjectsEnum.OrderCreated;
    queueGroupName: string = queueGroupName;

    onMessage = async function (data: IOrderCreatedEvent['data'], msg: Message) {
        const order = Order.build({
            id: data.id,
            price: data.ticket.price,
            status: data.status,
            userId: data.userId,
            version: data.version
        });
        await order.save()
        msg.ack();
    }
}