import { IOrderCreatedEvent, Listener, SubjectsEnum } from "@tytickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/tickets";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";


export class OrderCreatedListener extends Listener<IOrderCreatedEvent> {
    readonly subject = SubjectsEnum.OrderCreated;
    queueGroupName: string = queueGroupName

    onMessage = async function (data: IOrderCreatedEvent['data'], msg: Message) {
        // Find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id)

        // If no ticket, throw error
        if (!ticket) {
            throw new Error("Ticket not found.")
        }

        // Mark the ticket as reserved by setting its orderid property and save
        ticket.set({ orderId: data.id });
        await ticket.save();

        // @ts-ignore
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId
        })

        // ack the message
        msg.ack()
    }
}