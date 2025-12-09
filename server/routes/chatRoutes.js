import express from 'express';
import {protect} from "../middlewares/authMiddleware.js";
import {getAllUserChat, getChat, sendChatMessage} from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.post('/', protect, getChat)
chatRouter.get('/user', protect, getAllUserChat)
chatRouter.post('/send-message', protect, sendChatMessage)

export default chatRouter;