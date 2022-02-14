import { Publisher, IExpirationCompleteEvent, SubjectsEnum } from "@tytickets/common";



export class ExpirationCompletePublisher extends Publisher<IExpirationCompleteEvent> {
    readonly subject = SubjectsEnum.ExpirationComplete;
}