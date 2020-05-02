import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { MeetingStatus } from "../interfaces/meeting-status";
import { File } from "./File.entity";
import { User } from "./User.entity";

@Entity({
    name: 'meetings'
})
export class Meeting extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string = uuid();

    @Column()
    name: string;

    @Column({
        name: 'start_time',
        type: 'timestamp'
    })
    startTime: string;

    @Column({
        name: 'end_time',
        type: 'timestamp'
    })
    endTime: string;

    @Column({
        type: 'text',
        nullable: true
    })
    description?: string;

    @Column({
        name: 'meeting_url',
        nullable: true
    })
    url?: string;

    @Column({
        type: 'varchar'
    })
    status: MeetingStatus = MeetingStatus.Incomming;

    @OneToOne(() => File, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        nullable: true
    })
    @JoinColumn({
        name: 'record_id',
        referencedColumnName: 'id'
    })
    record?: File;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'user_meetings',
        joinColumn: {
            name: 'meeting_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        }
    })
    participants: User[];

    @ManyToOne(() => User, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        nullable: true
    })
    @JoinColumn({
        name: 'host_id',
        referencedColumnName: 'id'
    })
    host: User;
}