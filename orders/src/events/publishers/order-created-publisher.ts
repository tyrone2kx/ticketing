import { Publisher, IOrderCreatedEvent, SubjectsEnum } from "@tytickets/common";


export class OrderCreatedPublisher extends Publisher<IOrderCreatedEvent> {
    subject: SubjectsEnum.OrderCreated = SubjectsEnum.OrderCreated
}