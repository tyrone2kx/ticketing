import { currentUserMiddleware } from '@tytickets/common';
import express from 'express';


const router = express.Router();

router.get('/api/users/currentuser', currentUserMiddleware, (req, res) => {
    res.send({ currentUser: req.currentUser || null })
});

export { router as currentUserRouter }