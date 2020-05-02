// tslint:disable: variable-name
import { ViewEntity, ViewColumn, SelectQueryBuilder } from "typeorm";
import { MeetingStatus } from "../interfaces/meeting-status";
import { Meeting } from "./Meeting.entity";
import { User } from "./User.entity";

@ViewEntity({
    expression: (connection) => {
        return connection.createQueryBuilder()
            .select('meeting_data.*')
            .from((qb) => {
                return qb.addSelect('meetings.*')
                    .addSelect('user_meetings.user_id', 'user_id')
                    .from(Meeting, 'meetings')
                    .innerJoin('user_meetings', 'user_meetings', 'meetings.id=user_meetings.meeting_id');
            }, 'meeting_data')
            .innerJoin((qb: SelectQueryBuilder<any>) => {
                return qb
                    .addSelect('users.id', 'user_id')
                    .addSelect('users.firstName', 'firstName')
                    .addSelect('users.lastName', 'lastName')
                    .addSelect('users.email', 'email')
                    .addSelect('users.role', 'role')
                    .addSelect('user_meetings.meeting_id', 'meeting_id')
                    .from(User, 'users')
                    .innerJoin('user_meetings', 'user_meetings', 'users.id=user_meetings.user_id');
            }, 'user_data', 'meeting_data.user_id=user_data.user_id');
    }
})
export class MeetingParticipant {
    @ViewColumn()
    id: string;

    @ViewColumn()
    start_time: string;

    @ViewColumn()
    end_time: string;

    @ViewColumn()
    status: MeetingStatus;

    @ViewColumn()
    description: string;

    @ViewColumn()
    meeting_url: string;

    @ViewColumn()
    record_id: string;

    @ViewColumn()
    name: string;

    @ViewColumn()
    host_id: string;

    @ViewColumn()
    user_id: string;
}