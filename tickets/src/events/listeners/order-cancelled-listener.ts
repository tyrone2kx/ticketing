import { IOrderCancelledEvent, Listener, SubjectsEnum } from "@tytickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/tickets";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";


export class OrderCancelledListener extends Listener<IOrderCancelledEvent> {
    readonly subject = SubjectsEnum.OrderCancelled
    queueGroupName: string = queueGroupName

    onMessage = async function (data: IOrderCancelledEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id)

        if (!ticket) {
            throw new Error("Ticket not found")
        }
        ticket.set({ orderId: undefined })
        await ticket.save()

        // @ts-ignore
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            orderId: ticket.orderId,
            userId: ticket.userId,
            price: ticket.price,
            title: ticket.title,
            version: ticket.version,
        });

        msg.ack();
    }
}