import { NextFunction, Request, Response, Router } from "express";
import { Roles } from "../interfaces/roles";
import { authorize } from "../middlewares/authorize";
import { ConversationService } from "../services/conversation-service";
import { MessageService } from "../services/message-service";
import { SocketManager } from "../socket";

export class MessageController {
    private static _messageService = new MessageService();
    private static _conversationService = new ConversationService();

    get router() {
        const router = Router();

        router.post('/', authorize(Roles.Tutor, Roles.Student), this.sendMessage);
        router.get('/', authorize(Roles.Tutor, Roles.Student), this.getConversations);
        router.get('/:conversationId', authorize(Roles.Tutor, Roles.Student), this.getMessages);

        return router;
    }

    getMessages = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, role } = res.locals.user;
            const { conversationId } = req.params;
            let where: any = {
                conversation: {
                    id: conversationId
                }
            };
            if (role === Roles.Tutor) {
                where = {
                    conversation: {
                        ...where.conversation,
                        tutor: {
                            id
                        }
                    }
                };
            } else {
                where = {
                    conversation: {
                        ...where.conversation,
                        student: {
                            id
                        }
                    }
                };
            }
            const messages = await MessageController._messageService.getMessages(where, ['from', 'to']);
            res.json(messages);
        } catch (error) {
            next(error);
        }
    }

    getConversations = async (req: Request, res: Response, next: NextFunction) => {
        const { id, role } = res.locals.user;
        let where: any = {};
        if (role === Roles.Tutor) {
            where = {
                tutor: {
                    id
                }
            };
        } else {
            where = {
                student: {
                    id
                }
            };
        }
        try {
            const conversations = await MessageController._conversationService.getConversations(where, ['tutor', 'tutor.avatar', 'student', 'student.avatar']);
            res.json(conversations);
        } catch (error) {
            next(error);
        }
    }

    sendMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { content, to } = req.body;
            const { user } = res.locals;
            if (!user) return res.status(401).json({
                error_message: 'Unauthorized'
            });
            const data = {
                from: user.id,
                to,
                content
            };
            const tutorId = user.role === Roles.Tutor ? user.id : to;
            const studentId = user.role === Roles.Student ? user.id : to;
            let conversation = await MessageController._conversationService.getConversationByUserIds(tutorId, studentId);
            if (!conversation) {
                conversation = await MessageController._conversationService.createConversation(tutorId, studentId);
            }
            const message = await MessageController._messageService.addMessage(data, conversation.id);
            res.json(message);
            SocketManager.sendNoti({
                type: 'message',
                message
            }, message.to.id);
        } catch (error) {
            next(error);
        }
    }
}