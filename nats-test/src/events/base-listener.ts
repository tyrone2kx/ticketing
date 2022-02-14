import { Message, Stan } from 'node-nats-streaming'
import { SubjectsEnum } from './subjects';


interface IEvent {
    subject: SubjectsEnum;
    data: any;
}



abstract class Listener<T extends IEvent> {
    abstract subject: T['subject'];
    abstract queueGroupName: string;
    abstract onMessage: (data: T['data'], msg: Message) => void;
    private client: Stan;
    protected ackWait = 5 * 1000

    constructor(client: Stan) {
        this.client = client;
    }

    subscriptionOptions() {
        return this.client
            .subscriptionOptions()
            .setManualAckMode(true)
            .setAckWait(this.ackWait)
            .setDeliverAllAvailable()
            .setDurableName(this.queueGroupName)
    }

    listen() {
        const subscription = this.client.subscribe(
            this.subject,
            this.queueGroupName,
            this.subscriptionOptions()
        )
        subscription.on('message', (msg: Message) => {
            console.log(`Message Received: #${this.subject} / ${this.queueGroupName}`)
            const parsedData = this.parseMessage(msg)
            this.onMessage(parsedData, msg)
        })
    }

    parseMessage(msg: Message) {
        const data = msg.getData()
        return typeof data === 'string'
            ? JSON.parse(data)
            : JSON.parse(data.toString('utf-8'))
    }
}

export { Listener }