import { DAO } from "../DAOs";
import { Comment } from "../entity/Comment.entity";

export class CommentService {
    async deleteComment(id: string) {
        try {
            await DAO.comments.delete(id);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async addComment(postId: string, commentData: Partial<Comment>, commentedBy: string) {
        try {
            const comment = DAO.comments.create(commentData);
            const post = await DAO.posts.findOne(postId);
            if (!post) throw new Error('Post not found');
            const commentedByUser = await DAO.users.findOne(commentedBy);
            comment.post = post;
            comment.commentedBy = commentedByUser;
            await comment.save();
            return comment;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}