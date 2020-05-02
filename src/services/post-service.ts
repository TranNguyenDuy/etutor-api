import { In } from "typeorm";
import { DAO } from "../DAOs";
import { Post } from "../entity/Post.entity";
import { DocType } from "../interfaces/doc-type";
import { Roles } from "../interfaces/roles";

export class PostService {
    async countUserPosts(id: string, type: DocType = DocType.Blog) {
        try {
            const count = await DAO.posts.count({
                author: {
                    id
                },
                type
            });
            return count;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async updatePost(userId: string, postId: string, data: Partial<Post>) {
        try {
            const post = await DAO.posts.findOne(postId, {
                where: {
                    author: {
                        id: userId
                    }
                }
            });
            if (!post) throw new Error('Cannot find post');
            const updatedPost = {
                ...post,
                ...data
            };
            if (updatedPost.attachments && updatedPost.attachments.length) {
                const attachments = await DAO.files.findByIds(updatedPost.attachments.map(a => a.id));
                updatedPost.attachments = attachments;
            }
            await DAO.posts.save(updatedPost);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async deletePost(userId: string, postId: string) {
        try {
            await DAO.posts.delete({
                id: postId,
                author: {
                    id: userId
                }
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getPostDetails(id: string, type: DocType) {
        try {
            const post = await DAO.posts.findOne(id, {
                where: {
                    type
                },
                relations: ['author', 'attachments', 'comments', 'comments.commentedBy']
            });
            return post;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getPosts(user, type: DocType) {
        try {
            let where: any = {
                type
            };
            if (type === DocType.Document) {
                switch (user.role) {
                    case Roles.Student:
                        where = {
                            ...where,
                            author: {
                                id: user.id
                            }
                        };
                        break;
                    case Roles.Tutor:
                        const students = await DAO.users.find({
                            where: {
                                tutor: {
                                    id: user.id
                                }
                            }
                        });
                        where = {
                            ...where,
                            author: {
                                id: students.length ? In(students.map(s => s.id)) : undefined
                            }
                        };
                        break;
                    default:
                        break;
                }
            }
            const posts = await DAO.posts.find({
                where,
                relations: ['author', 'attachments', 'comments', 'comments.commentedBy']
            });
            return posts;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}