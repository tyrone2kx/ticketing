import { OrderStatusEnum } from '@tytickets/common';
import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';


interface IPaymentAttrs {
    orderId: string;
    stripeId: string;
}


interface IPaymentDoc extends mongoose.Document {
    orderId: string;
    stripeId: string;
    version: number
}


interface IPaymentModel extends mongoose.Model<IPaymentDoc> {
    build: (attrs: IPaymentAttrs) => IPaymentDoc
}


const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
    },
    stripeId: {
        type: String,
        required: true,
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id
        }
    }
});


paymentSchema.set('versionKey', 'version')
paymentSchema.plugin(updateIfCurrentPlugin)

paymentSchema.statics.build = (attrs: IPaymentAttrs) => {
    return new Payment(attrs);
}

const Payment = mongoose.model<IPaymentDoc, IPaymentModel>('Payment', paymentSchema)

export { Payment }
