import { NextFunction, Request, Response, Router } from 'express';
import { Like } from 'typeorm';
import { newStudentsAssigned } from '../email-messages/new-students-assigned';
import { newTutorAssigned } from '../email-messages/new-tutor-assigned';
import { newUserMessage } from '../email-messages/new-user';
import { User } from '../entity/User.entity';
import { ListQuery, ListResponse } from '../interfaces/list-query';
import { Roles } from '../interfaces/roles';
import { authorize } from '../middlewares/authorize';
import { ConversationService } from '../services/conversation-service';
import { EmailService } from '../services/email-service';
import { UserService } from '../services/user-service';

export class UserController {
  get router() {
    const router = Router();

    router.post('/:id/revoke-tutor', authorize(Roles.Staff, Roles.Admin), this.revokeTutor);
    router.post('/assign-tutor', authorize(Roles.Admin, Roles.Staff), this.assignTutor);
    router.delete(
      '/:role/:id',
      (req: Request, res: Response, next: NextFunction) => {
        const { role } = req.params;
        switch (role) {
          case Roles.Staff:
            return authorize(Roles.Admin)(req, res, next);
          case Roles.Tutor:
            return authorize(Roles.Admin, Roles.Staff)(req, res, next);
          case Roles.Student:
            return authorize(Roles.Admin, Roles.Staff)(req, res, next);
          default:
            return authorize(Roles.Admin)(req, res, next);
        }
      },
      this.deleteUser,
    );
    router.patch(
      '/:role/:id',
      (req: Request, res: Response, next: NextFunction) => {
        const { role } = req.params;
        switch (role) {
          case Roles.Staff:
            return authorize(Roles.Admin)(req, res, next);
          case Roles.Tutor:
            return authorize(Roles.Admin, Roles.Staff)(req, res, next);
          case Roles.Student:
            return authorize(Roles.Admin, Roles.Staff)(req, res, next);
          default:
            return authorize(Roles.Admin)(req, res, next);
        }
      },
      this.updateUser,
    );
    router.get(
      '/:role/:id',
      (req: Request, res: Response, next: NextFunction) => {
        const { role } = req.params;
        switch (role) {
          case Roles.Staff:
            return authorize(Roles.Admin, Roles.Staff)(req, res, next);
          case Roles.Tutor:
            return authorize(Roles.Admin, Roles.Staff)(req, res, next);
          case Roles.Student:
            return authorize(Roles.Admin, Roles.Staff, Roles.Tutor)(req, res, next);
          default:
            return authorize(Roles.Admin)(req, res, next);
        }
      },
      this.getUserDetails,
    );
    router.get(
      '/:role',
      (req: Request, res: Response, next: NextFunction) => {
        const { role } = req.params;
        switch (role) {
          case Roles.Staff:
            return authorize(Roles.Admin, Roles.Staff)(req, res, next);
          case Roles.Tutor:
            return authorize(Roles.Admin, Roles.Staff)(req, res, next);
          case Roles.Student:
            return authorize(Roles.Admin, Roles.Staff, Roles.Tutor)(req, res, next);
          default:
            return authorize(Roles.Admin)(req, res, next);
        }
      },
      this.listUsers,
    );
    router.post(
      '/:role',
      (req: Request, res: Response, next: NextFunction) => {
        const { role } = req.params;
        switch (role) {
          case Roles.Staff:
            return authorize(Roles.Admin)(req, res, next);
          case Roles.Tutor:
            return authorize(Roles.Admin, Roles.Staff)(req, res, next);
          case Roles.Student:
            return authorize(Roles.Admin, Roles.Staff)(req, res, next);
          default:
            return authorize(Roles.Admin)(req, res, next);
        }
      },
      this.createUser,
    );

    return router;
  }

  revokeTutor = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const userService = new UserService();
      const result = await userService.revokeTutor(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  assignTutor = async (req: Request, res: Response, next: NextFunction) => {
    const { tutorId, studentIds } = req.body;
    try {
      const userService = new UserService();
      const [students, tutor] = await userService.assignTutor(studentIds, tutorId);
      res.json(students);
      const sendMail = async () => {
        const studentMails = (students as User[]).map(student => newTutorAssigned(student, tutor as User));
        const tutorMail = newStudentsAssigned(tutor as User, students as User[]);
        await EmailService.sendMail(tutorMail);
        for (const mail of studentMails) {
          await EmailService.sendMail(mail);
        }
      };
      sendMail()
        .catch(console.error);
      const createConversation = () => {
        const conversationService = new ConversationService();
        (students as User[]).forEach(async (student) => {
          try {
            const existingConversation = await conversationService.getConversationByUserIds(tutorId, student.id);
            if (existingConversation) return;
            await conversationService.createConversation(tutorId, student.id);
          } catch (error) {
            console.error(error);
          }
        });
      };
      createConversation();
    } catch (error) {
      next(error);
    }
  }

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const userService = new UserService();
      await userService.deleteUser(id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const { id } = req.params;
    try {
      const userService = new UserService();
      await userService.updateUser(id, data);
      res.json({ id });
    } catch (error) {
      next(error);
    }
  }

  getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role, id } = req.params;
      const userService = new UserService();
      const relations: string[] = ['students', 'tutor'];
      const user = await userService.getUserDetails(id, role, relations);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.body;
    const { role } = req.params;
    user.role = role;

    try {
      const userService = new UserService();
      const result = await userService.createUser(user);
      const password = result.password;
      delete result.password;
      res.json(result);
      await EmailService.sendMail(newUserMessage({
        ...user,
        password
      }));
    } catch (error) {
      next(error);
    }
  }

  listUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.params;
    const query: ListQuery = new ListQuery(req.query.key, req.query.page, req.query.pageSize, req.query.sortKey, req.query.sortDirection);
    const userService = new UserService();
    let where: any = {
      role: role as Roles,
    };
    if (query.key) {
      where = [
        {
          firstName: Like(`%${query.key}%`),
          role: role as Roles,
        },
        {
          lastName: Like(`%${query.key}%`),
          role: role as Roles,
        },
      ];
    }
    try {
      const [users, total] = await userService.listUsers(where, query);
      const responseData: ListResponse<User> = {
        data: users as User[],
        metadata: {
          ...query,
          total: total as number,
        },
      };
      res.json(responseData);
    } catch (error) {
      next(error);
    }
  }
}
