import { BadRequestError, validateRequest } from '@tytickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { PasswordManager } from '../services/password-manager';

const router = express.Router();

router.post('/api/users/signin', [
    body('email')
        .isEmail()
        .withMessage('Enter a valid email.'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Enter a valid password.')
], validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            throw new BadRequestError("Invalid credentials")
        }
        const passwordMatch = await PasswordManager.compare(existingUser.password, password)
        if (!passwordMatch) {
            throw new BadRequestError("Invalid credentials")
        }
        // Generate jwt 
        const userJwt = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        }, process.env.JWT_KEY!)
    
        // Store it on the session object
        req.session = {
            jwt: userJwt
        };
    
        res.status(200).send(existingUser)
    })

export { router as signinRouter }