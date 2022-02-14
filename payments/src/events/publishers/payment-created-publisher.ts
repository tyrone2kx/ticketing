import { Publisher, IPaymentCreatedEvent, SubjectsEnum } from "@tytickets/common";

export class PaymentCreatedPublisher extends Publisher<IPaymentCreatedEvent> {
    readonly subject = SubjectsEnum.PaymentCreated;
}