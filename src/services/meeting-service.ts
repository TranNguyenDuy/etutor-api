import moment from "moment";
import { LessThan } from "typeorm";
import { DAO } from "../DAOs";
import { Meeting } from "../entity/Meeting.entity";
import { MeetingStatus } from "../interfaces/meeting-status";
import { UserService } from "./user-service";

export class MeetingService {
    private _userService = new UserService();

    async countUserMeetings(id: string) {
        try {
            const meetings = await DAO.meetingParticipants.find({
                where: [{
                    user_id: id
                }, {
                    host_id: id
                }]
            });
            return meetings.length;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async updateMeetingStatus() {
        try {
            const TODAY = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
            const meetings = await DAO.meetings.find({
                where: {
                    status: MeetingStatus.Incomming,
                    startTime: LessThan(TODAY)
                }
            });
            meetings.forEach(meeting => {
                meeting.status = MeetingStatus.Past;
            });
            await DAO.meetings.save(meetings);
        } catch (error) {
            console.error(error);
        }
    }

    async cancelMeeting(id: string, userId: string) {
        try {
            const meeting = await DAO.meetings.findOne(id, {
                relations: ['host']
            });
            if (!meeting) throw new Error('Cannot find this meeting');
            if (!meeting.host || meeting.host.id !== userId) throw new Error('You are not allowed to cancel this meeting');
            meeting.status = MeetingStatus.Canceled;
            await meeting.save();
            return meeting;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getMeetings(userId) {
        try {
            const meetings = await DAO.meetingParticipants.find({
                where: [{
                    user_id: userId
                }, {
                    host_id: userId
                }],
                order: {
                    start_time: 'ASC'
                }
            });
            return meetings;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async updateMeeting(data: Partial<Meeting>, participantIds: string[]) {
        try {
            if (!data.id) throw new Error('Cannot identify meeting');
            let meeting = await this.getMeetingDetails(data.id);
            const participants = await this._userService.getUsersByIds(participantIds);
            meeting.name = data.name;
            meeting.startTime = data.startTime;
            meeting.endTime = data.endTime;
            meeting.url = data.url;
            meeting.description = data.description;
            meeting.participants = participants;
            meeting = await meeting.save();
            return meeting;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getMeetingDetails(id: string, relations: string[] = []) {
        try {
            const meeting = await DAO.meetings.findOne(id, {
                relations
            });
            if (!meeting) throw new Error('Meeting not found');
            return meeting;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async createMeeting(meetingData: Partial<Meeting>, participantIds: string[], hostId: string) {
        try {
            const participants = await this._userService.getUsersByIds(participantIds);
            const host = await this._userService.getUserById(hostId);
            const meeting = DAO.meetings.create(meetingData);
            meeting.participants = participants;
            meeting.host = host;
            await meeting.save();
            return meeting;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}