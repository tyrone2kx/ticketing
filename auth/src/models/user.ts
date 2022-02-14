import mongoose from 'mongoose';
import { PasswordManager } from '../services/password-manager';


interface IUserAttrs {
    email: string;
    password: string
}

// An interface that describes the properties a user model has

interface IUserModel extends mongoose.Model<IUserDoc> {
    build: (attrs: IUserAttrs) => IUserDoc
}

// An interface that describes the properties a user document has

interface IUserDoc extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    // versionKey: false,
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
            delete ret.password
            delete ret.__v;
        }
    }
});

userSchema.pre('save', async function(done) {
    if(this.isModified('password')) {
        const hashed = await PasswordManager.toHash(this.get('password'))
        this.set('password', hashed);
    }
    done();
})

userSchema.statics.build = (attrs: IUserAttrs) => {
    return new User(attrs)
}

const User = mongoose.model<IUserDoc, IUserModel>('User', userSchema)


export { User };