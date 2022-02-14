import {Listener, IOrderCreatedEvent, SubjectsEnum} from '@tytickets/common'
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../../queues/expiration-queue';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<IOrderCreatedEvent> {
    readonly subject = SubjectsEnum.OrderCreated;
    queueGroupName: string = queueGroupName;

    onMessage = async function (data: IOrderCreatedEvent['data'], msg: Message) {

        const delay = new Date(data.expiresAt).getTime() - new Date().getTime()

        await expirationQueue.add({
            orderId: data.id
        }, {
            delay
        });
        msg.ack();
    }
}