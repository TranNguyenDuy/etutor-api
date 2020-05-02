import { NextFunction, Request, Response, Router } from "express";
import { DocType } from "../interfaces/doc-type";
import { Roles } from "../interfaces/roles";
import { authorize } from "../middlewares/authorize";
import { MeetingService } from "../services/meeting-service";
import { MessageService } from "../services/message-service";
import { PostService } from "../services/post-service";
import { UserService } from "../services/user-service";

export class DashboardController {
    private static _userService = new UserService();
    private static _messageService = new MessageService();
    private static _postService = new PostService();
    private static _meetingService = new MeetingService();

    get router() {
        const router = Router();

        router.get('/', authorize(), this.getMyDashboard);

        return router;
    }

    getMyDashboard = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = res.locals;
            let result: any = {};
            switch (user.role) {
                case Roles.Student:
                    result = await this.getStudentDashboard(user.id);
                    break;
                case Roles.Tutor:
                    result = await this.getTutorDashboard(user.id);
                    break;
                case Roles.Staff:
                    result = await this.getStaffDashboard();
                    break;
                case Roles.Admin:
                    result = await this.getStaffDashboard();
                    break;
                default:
                    break;
            }
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    getStaffDashboard = async () => {
        const promises: Promise<number>[] = [];
        // number of students
        promises.push(DashboardController._userService.countUsers(Roles.Student));
        // number of tutors
        promises.push(DashboardController._userService.countUsers(Roles.Tutor));
        const [studentCount, tutorCount] = await Promise.all(promises);
        return {
            student: {
                count: studentCount,
                label: 'Students'
            },
            tutor: {
                count: tutorCount,
                label: 'Tutors'
            }
        };
    }

    getTutorDashboard = async id => {
        const promises: Promise<number>[] = [];
        // number of messages with students
        promises.push(DashboardController._messageService.countUserSentMessages(id));
        // number of meetings
        promises.push(DashboardController._meetingService.countUserMeetings(id));
        // number of posts
        promises.push(DashboardController._postService.countUserPosts(id));
        // number of students
        promises.push(DashboardController._userService.countMyStudents(id));

        const [messageCount, meetingCount, postCount, studentCount] = await Promise.all(promises);

        return {
            message: {
                count: messageCount,
                label: 'Messages sent'
            },
            meeting: {
                count: meetingCount,
                label: 'Meetings'
            },
            post: {
                count: postCount,
                label: 'Posts uploaded'
            },
            student: {
                count: studentCount,
                label: 'Students assigned'
            }
        };
    }

    getStudentDashboard = async id => {
        const promises: Promise<number>[] = [];
        // number of messages with tutor
        promises.push(DashboardController._messageService.countUserSentMessages(id));
        // number of meetings
        promises.push(DashboardController._meetingService.countUserMeetings(id));
        // number of documents
        promises.push(DashboardController._postService.countUserPosts(id, DocType.Document));
        // number of posts
        promises.push(DashboardController._postService.countUserPosts(id, DocType.Blog));

        const [messageCount, meetingCount, documentCount, blogCount] = await Promise.all(promises);

        return {
            message: {
                count: messageCount,
                label: 'Messages sent'
            },
            meeting: {
                count: meetingCount,
                label: 'Meetings'
            },
            document: {
                count: documentCount,
                label: 'Documents uploaded'
            },
            blog: {
                count: blogCount,
                label: 'Posts uploaded'
            }
        };
    }
}