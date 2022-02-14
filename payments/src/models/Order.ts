import { OrderStatusEnum } from '@tytickets/common';
import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';


interface IOrderAttrs {
    id: string;
    userId: string;
    status: OrderStatusEnum;
    version: number;
    price: number;
}


interface IOrderDoc extends mongoose.Document {
    userId: string;
    status: OrderStatusEnum;
    price: number;
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
        enum: Object.values(OrderStatusEnum)
    },
    price: {
        type: Number
    },
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
    return new Order({
        _id: attrs.id,
        version: attrs.version,
        price: attrs.price,
        userId: attrs.userId,
        status: attrs.status
    });
}

const Order = mongoose.model<IOrderDoc, IOrderModel>('Order', orderSchema)

export { Order }
