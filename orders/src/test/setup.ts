import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { ConnectOptions } from 'mongoose';
import jwt from 'jsonwebtoken'

declare global {
    var signinCookie: () => string;
}


jest.mock('../nats-wrapper');

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


global.signinCookie = () => {
    // Build a jwt payload {email, id}
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
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