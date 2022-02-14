import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { ConnectOptions } from 'mongoose';
import { app } from '../app';
import request from 'supertest'
import jwt from 'jsonwebtoken'

declare global {
    var signinCookie: (id?: string) => string;
}


jest.mock('../nats-wrapper');

process.env.STRIPE_KEY = "sk_test_51KQFTWCnBQFhAut35ImqmED5Vp5lB6KWxJrc5ZmsmbhPCj1Gd3S6EabCEaB6yiKG2ImCPDJqFHSu8UgZpHWFRJiN00uYgAcJ5K"

let mongo: any

beforeAll(async () => {
    process.env.JWT_KEY = 'afadfadgsfg'
    mongo = await MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions)
});


beforeEach(async () => {
    jest.clearAllMocks()
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
})

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close()
})


global.signinCookie = (id?: string) => {
    // Build a jwt payload {email, id}
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }

    // Create jwt
    const token = jwt.sign(payload, process.env.JWT_KEY!)

    // Build session object
    const session = { jwt: token }

    // Turn the session into JSON
    const sessionJSON = JSON.stringify(session)

    // Take JSON and encode it to base64
    const base64 = Buffer.from(sessionJSON).toString('base64')

    // Return the cookie
    return `express:sess=${base64}`
}