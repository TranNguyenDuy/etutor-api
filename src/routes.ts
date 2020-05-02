import { Router } from "express";
import { DashboardController } from "./controllers/dashboard-controller";
import { FileController } from "./controllers/file-controller";
import { MeetingController } from "./controllers/meeting-controller";
import { MessageController } from "./controllers/message-controller";
import { OAuthController } from "./controllers/oauth-controller";
import { PostController } from "./controllers/post-controller";
import { UserController } from "./controllers/user-controller";

const oauthController = new OAuthController();
const userController = new UserController();
const messageController = new MessageController();
const fileController = new FileController();
const meetingController = new MeetingController();
const postController = new PostController();
const dashboardController = new DashboardController();

export const routes = (() => {
  const router = Router();

  router.use("/oauth", oauthController.router);
  router.use("/users", userController.router);
  router.use('/messages', messageController.router);
  router.use('/files', fileController.router);
  router.use('/meetings', meetingController.router);
  router.use('/posts', postController.router);
  router.use('/dashboard', dashboardController.router);

  return router;
})();
