import { NextFunction, Request, Response, Router } from "express";
import { User } from "../entity/User.entity";
import { Roles } from "../interfaces/roles";
import { authorize } from "../middlewares/authorize";
import { requirePayload } from "../middlewares/require-payload";
import { UserService } from "../services/user-service";
import { JWT } from "../utils/jwt";

export class OAuthController {
  get router() {
    const router = Router();

    router.post("/logout", this.logout);
    router.post(
      "/login",
      requirePayload("body", "email", "password"),
      this.login
    );
    router.post(
      "/:role/signup",
      requirePayload("body", "email", "password", "firstName", "lastName"),
      this.signup
    );
    router.get("/me", authorize(), (req, res) => {
      res.json(res.locals.user);
    });

    return router;
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const userService = new UserService();
      const user = await userService.getUserByEmailPassword(email, password, ['avatar']);
      if (!user)
        return res.status(401).json({
          error_message: "Wrong email or password"
        });
      const token = JWT.sign(Object.assign({}, user), "30days");
      res
        .cookie("access_token", token, {
          httpOnly: false
        })
        .json(user);
    } catch (error) {
      next(error);
    }
  }

  logout = (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("access_token");
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = req.params;
      const { email, password, firstName, lastName } = req.body;
      const user: Partial<User> = {
        email,
        password,
        firstName,
        lastName,
        role: role as Roles
      };
      const userService = new UserService();
      const result = await userService.createUser(user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
