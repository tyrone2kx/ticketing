import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderStatusEnum } from './Order';


interface ITicketAttrs {
    title: string,
    price: number,
    id: string,
}

export interface ITicketDoc extends mongoose.Document {
    title: string,
    price: number,
    version: number,
    isReserved: () => Promise<boolean>
}


interface ITicketModel extends mongoose.Model<ITicketDoc> {
    build: (attrs: ITicketAttrs) => ITicketDoc,
    findByEvent: (data: { id: string, version: number }) => Promise<ITicketDoc | null>
}


const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    }
});

ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)

ticketSchema.statics.build = (attrs: ITicketAttrs) => {
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price,
    })
}

ticketSchema.statics.findByEvent = (data: { id: string, version: number }) => {
    return Ticket.findOne({
        _id: data.id,
        version: data.version - 1
    });
}

ticketSchema.methods.isReserved = async function () {
    // this === the ticket document that we called isReserved on
    const existingOrder = await Order.findOne({
        ticket: this as any,
        status: {
            $in: [
                OrderStatusEnum.Created,
                OrderStatusEnum.AwaitingPayment,
                OrderStatusEnum.Complete,
            ]
        }
    })
    return !!existingOrder
}

const Ticket = mongoose.model<ITicketDoc, ITicketModel>('Ticket', ticketSchema)

export { Ticket }