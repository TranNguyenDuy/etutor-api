import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { Conversation } from "./Conversation.entity";
import { User } from "./User.entity";

@Entity({
    name: 'messages'
})
export class Message extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string = uuid();

    @ManyToOne(() => User, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        nullable: true
    })
    @JoinColumn({
        name: 'from_id',
        referencedColumnName: 'id'
    })
    from: User;

    @ManyToOne(() => User, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        nullable: true
    })
    @JoinColumn({
        name: 'to_id',
        referencedColumnName: 'id'
    })
    to: User;

    @Column({
        type: 'text'
    })
    content: string;

    @ManyToOne(() => Conversation, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        nullable: true
    })
    @JoinColumn({
        name: 'conversation_id',
        referencedColumnName: 'id'
    })
    conversation: Conversation;

    @Column({
        name: 'sent_at',
        type: 'timestamp'
    })
    @CreateDateColumn({
        type: 'timestamp',
        name: 'sent_at'
    })
    sentAt: string;
}