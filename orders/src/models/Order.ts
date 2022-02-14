import { OrderStatusEnum } from '@tytickets/common';
import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { ITicketDoc } from './Tickets';

export { OrderStatusEnum }

interface IOrderAttrs {
    userId: string;
    status: OrderStatusEnum;
    expiresAt: Date;
    ticket: ITicketDoc;
}


interface IOrderDoc extends mongoose.Document {
    userId: string;
    status: OrderStatusEnum;
    expiresAt: Date;
    ticket: ITicketDoc;
    version: number;
}



interface IOrderModel extends mongoose.Model<IOrderDoc> {
    build: (attrs: IOrderAttrs) => IOrderDoc
}


const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatusEnum),
        default: OrderStatusEnum.Created
    },
    expiredAt: {
        type: mongoose.Schema.Types.Date
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id
        }
    }
});


orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = (attrs: IOrderAttrs) => {
    return new Order(attrs)
}

const Order = mongoose.model<IOrderDoc, IOrderModel>('Order', orderSchema)

export { Order }