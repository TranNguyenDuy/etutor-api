import { NextFunction, Request, Response, Router } from "express";
import { DAO } from "../DAOs";
import { Post } from "../entity/Post.entity";
import { DocType } from "../interfaces/doc-type";
import { authorize } from "../middlewares/authorize";
import { requirePayload } from "../middlewares/require-payload";
import { CommentService } from "../services/comment-service";
import { PostService } from "../services/post-service";
import { UserService } from "../services/user-service";

export class PostController {
    private static _userService = new UserService();
    private static _postService = new PostService();
    private static _commentService = new CommentService();

    get router() {
        const router = Router();

        router.post('/', authorize(), requirePayload("body"), this.createPost);
        router.get('/:type', authorize(), this.getPosts);
        router.post('/:id/comments', authorize(), this.addComment);
        router.delete('/comments/:id', authorize(), this.deleteComment);
        router.get('/:type/:id', authorize(), this.getPostDetails);
        router.delete('/:id', authorize(), this.deletePost);
        router.patch('/:id', authorize(), this.updatePost);

        return router;
    }

    updatePost = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { user } = res.locals;
        const data = req.body;
        try {
            const updatedPost = await PostController._postService.updatePost(user.id, id, data);
            res.json(updatedPost);
        } catch (error) {
            next(error);
        }
    }

    deletePost = async (req: Request, res: Response, next: NextFunction) => {
        const { user } = res.locals;
        const { id } = req.params;
        try {
            await PostController._postService.deletePost(user.id, id);
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }
    getPostDetails = async (req: Request, res: Response, next: NextFunction) => {
        const { type, id } = req.params;
        try {
            const post = await PostController._postService.getPostDetails(id, type as DocType);
            res.json(post);
        } catch (error) {
            next(error);
        }
    }

    deleteComment = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            await PostController._commentService.deleteComment(id);
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }

    addComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id: postId } = req.params;
            const { user } = res.locals;
            const { comment } = req.body;
            const result = await PostController._commentService.addComment(postId, comment, user.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    getPosts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = res.locals;
            const type = req.params.type as DocType;
            const posts = await PostController._postService.getPosts(user, type);
            res.json(posts);
        } catch (error) {
            next(error);
        }
    }

    createPost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const postData: Partial<Post> = req.body;
            postData.attachments = postData.attachments || [];
            const { user } = res.locals;
            const post = DAO.posts.create(postData);
            const attachments = await DAO.files.findByIds(postData.attachments.map(file => file.id));
            post.attachments = attachments;
            post.author = await PostController._userService.getUserById(user.id);
            await post.save();
            res.json(post);
        } catch (error) {
            next(error);
        }
    }
}