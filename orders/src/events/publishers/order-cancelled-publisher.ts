import { Publisher, IOrderCancelledEvent, SubjectsEnum } from "@tytickets/common";


export class OrderCancelledPublisher extends Publisher<IOrderCancelledEvent> {
    subject: SubjectsEnum.OrderCancelled = SubjectsEnum.OrderCancelled
}