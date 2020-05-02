import { NextFunction, Request, Response, Router } from "express";
import { DAO } from "../DAOs";
import { authorize } from "../middlewares/authorize";
import { S3Service } from "../services/s3-service";
import { UserService } from "../services/user-service";
import { extractFileName } from "../utils/file";

export class FileController {
    private static _s3Service = new S3Service();
    private static _userService = new UserService();

    get router() {
        const router = Router();

        router.post('/avatar', authorize(), this.uploadAvatar('avatar'));
        router.post('/:type', authorize(), this.uploadFile);

        return router;
    }

    uploadFile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { type } = req.params;
            if (!req.files) return res.status(400).json({
                error_message: 'No file uploaded'
            });
            const uploadedFile: any = req.files[type];
            const { name, ext } = extractFileName(uploadedFile.name);
            const file = DAO.files.create({
                actualName: `${name}.${ext}`,
                ext
            });
            const fileName = `${name}.${file.id}.${ext}`;
            const { key } = await FileController._s3Service.pushFile('public', type, fileName, uploadedFile.data);
            file.path = key;
            await file.save();
            res.json(file);
        } catch (error) {
            next(error);
        }
    }

    uploadAvatar = (type: 'avatar') => {
        return async (req: Request, res: Response, next: NextFunction) => {
            const userId = res.locals.user.id;
            if (!req.files) return res.status(400).json({
                error_message: 'No file uploaded'
            });
            const uploadedFile: any = req.files[type];
            console.log(uploadedFile);
            const { name, ext } = extractFileName(uploadedFile.name);
            const file = DAO.files.create({
                actualName: `${name}.${ext}`,
                ext
            });
            const fileName = `${name}.${file.id}.${ext}`;
            try {
                const { key } = await FileController._s3Service.pushFile('public', type, fileName, uploadedFile.data);
                file.path = key;
                await file.save();
                const user = await FileController._userService.getUserById(userId);
                user.avatar = file;
                await FileController._userService.updateUser(user.id, user);
                res.json(user);
            } catch (error) {
                next(error);
            }
        };
    }
}