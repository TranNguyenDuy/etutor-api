import { NextFunction, Request, Response, Router } from "express";
import { DAO } from "../DAOs";
import { Roles } from "../interfaces/roles";
import { authorize } from "../middlewares/authorize";
import { requirePayload } from "../middlewares/require-payload";
import { MeetingService } from "../services/meeting-service";
import { UserService } from "../services/user-service";

export class MeetingController {
    private static _userService = new UserService();
    private static _meetingService = new MeetingService();

    get router() {
        const router = Router();

        router.get('/available-participants', authorize(), this.getAvailableMeetingParticipants);
        router.post('/', authorize(), requirePayload('body', 'meetingData', 'participants'), this.createMeeting);
        router.get('/me', authorize(), this.getMyMeetings);
        router.post('/:id/record', authorize(), requirePayload('body', 'file'), this.uploadRecord);
        router.get('/:id', authorize(), this.getMeetingDetails);
        router.patch('/:id', authorize(), this.updateMeeting);
        router.delete('/:id', authorize(), this.cancelMeeting);

        return router;
    }

    uploadRecord = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { file } = req.body;
            const meeting = await MeetingController._meetingService.getMeetingDetails(id);
            const fileData = await DAO.files.findOne(file.id);
            if (!fileData) return res.status(400).json({
                error_message: 'Cannot find uploaded file'
            });
            if (!meeting) return res.status(400).json({
                error_message: 'Cannot find meeting'
            });
            meeting.record = fileData;
            await meeting.save();
            res.json(meeting);
        } catch (error) {
            next(error);
        }
    }

    cancelMeeting = async (req: Request, res: Response, next: NextFunction) => {
        const { user } = res.locals;
        const { id } = req.params;
        try {
            const meeting = await MeetingController._meetingService.cancelMeeting(id, user.id);
            res.json(meeting);
        } catch (error) {
            next(error);
        }
    }

    getMyMeetings = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user: { id } } = res.locals;
            const meetings = await MeetingController._meetingService.getMeetings(id);
            res.json(meetings);
        } catch (error) {
            next(error);
        }
    }

    updateMeeting = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { meetingData, participants } = req.body;
            const updatedMeeting = await MeetingController._meetingService.updateMeeting({
                ...meetingData,
                id
            }, participants);
            res.json(updatedMeeting);
        } catch (error) {
            next(error);
        }
    }

    getMeetingDetails = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const meeting = await MeetingController._meetingService.getMeetingDetails(id, ['participants', 'record', 'host']);
            res.json(meeting);
        } catch (error) {
            next(error);
        }
    }

    createMeeting = async (req: Request, res: Response, next: NextFunction) => {
        const { meetingData, participants } = req.body;
        const { user } = res.locals;
        try {
            const meeting = await MeetingController._meetingService.createMeeting(meetingData, [...participants], user.id);
            res.json(meeting);
        } catch (error) {
            next(error);
        }
    }

    getAvailableMeetingParticipants = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user } = res.locals;
            if (user.role === Roles.Tutor) {
                const [students] = await MeetingController._userService.listUsers({
                    tutor: {
                        id: user.id
                    }
                }, {
                    page: 0,
                    pageSize: 10000
                });
                res.json(students);
            } else if (user.role === Roles.Student) {
                const me = await MeetingController._userService.getUserDetails(user.id, Roles.Student, ['tutor']);
                res.json([me.tutor]);
            } else {
                res.json([]);
            }
        } catch (error) {
            next(error);
        }
    }
}