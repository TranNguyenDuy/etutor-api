import { DAO } from "../DAOs";

export class ConversationService {
    async getConversations(where: any, relations: string[] = []) {
        try {
            const conversations = await DAO.conversations.find({
                where,
                relations
            });
            return conversations;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getConversationByUserIds(tutorId: string, studentId: string) {
        try {
            const conversation = await DAO.conversations.findOne({
                where: {
                    tutor: {
                        id: tutorId
                    },
                    student: {
                        id: studentId
                    }
                }
            });
            return conversation;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async createConversation(tutorId: string, studentId: string) {
        try {
            const conversation = await DAO.conversations.create({
                tutor: {
                    id: tutorId
                },
                student: {
                    id: studentId
                }
            });
            await conversation.save();
            return conversation;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}