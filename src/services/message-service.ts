import { DAO } from "../DAOs";
import { Message } from "../entity/Message.entity";

export class MessageService {
    async countUserSentMessages(id: string) {
        try {
            const count = await DAO.messages.count({
                where: [{
                    from: id
                }]
            });
            return count;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getMessages(where: any, relations: string[] = []) {
        try {
            const messages = await DAO.messages.find({
                where,
                relations,
                order: {
                    sentAt: 'DESC'
                }
            });
            return messages;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    async addMessage(data: Partial<Message>, conversationId: string) {
        try {
            if (!data.content) throw new Error('Cannot send empty message');
            if (!data.from) throw new Error('Cannot identify sender');
            if (!data.to) throw new Error('Cannot identify receiver');
            if (!conversationId) throw new Error('Missing conversation info');
            const conversation = await DAO.conversations.findOne(conversationId);
            if (!conversation) throw new Error('Cannot get conversation info');
            data.conversation = conversation;
            const from = await DAO.users.findOne(data.from);
            const to = await DAO.users.findOne(data.to);
            if (!from) throw new Error('Cannot find user ' + data.from);
            if (!to) throw new Error('Cannot find user ' + data.to);
            let message = await DAO.messages.create(data);
            message.from = from;
            message.to = to;
            await message.save();
            message = await DAO.messages.findOne(message.id, {
                relations: [
                    'conversation',
                    'conversation.tutor',
                    'conversation.student',
                    'from',
                    'to'
                ]
            });
            return message;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}