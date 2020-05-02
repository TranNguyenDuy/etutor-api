import schedule from 'node-schedule';
import { MeetingService } from './services/meeting-service';

export class Schedule {
    private static _meetingService = new MeetingService();

    private static _jobs: schedule.Job[] = [];

    static run() {
        this.setupAutoUpdateMeetingState();
    }

    static cancel() {
        Schedule._jobs.forEach(job => {
            job.cancel();
        });
    }

    static setupAutoUpdateMeetingState = () => {
        Schedule._jobs.push(schedule.scheduleJob({
            second: 1
        }, () => {
            Schedule._meetingService.updateMeetingStatus();
        }));
    }
}