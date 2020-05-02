import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { Message } from "./Message.entity";
import { User } from "./User.entity";

@Entity({
    name: 'conversations'
})
export class Conversation extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string = uuid();

    @ManyToOne(() => User, (user) => user.conversationsWithStudents)
    @JoinColumn({
        name: 'tutor_id',
        referencedColumnName: 'id'
    })
    tutor: User;

    @ManyToOne(() => User, (user) => user.conversationsWithTutors)
    @JoinColumn({
        name: 'student_id',
        referencedColumnName: 'id'
    })
    student: User;

    @OneToMany(() => Message, message => message.conversation)
    messages: Message[];
}