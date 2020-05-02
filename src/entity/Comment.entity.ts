import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { Post } from "./Post.entity";
import { User } from "./User.entity";

@Entity({
    name: 'comments'
})
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string = uuid();

    @Column({
        type: 'text'
    })
    content: string;

    @ManyToOne(() => Post, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        nullable: true
    })
    @JoinColumn({
        name: 'post_id',
        referencedColumnName: 'id'
    })
    post?: Post;

    @ManyToOne(() => User, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        nullable: true
    })
    @JoinColumn({
        name: 'commented_by',
        referencedColumnName: 'id'
    })
    commentedBy?: User;

    @CreateDateColumn({
        name: 'commented_at',
        type: 'timestamp'
    })
    commentedAt: string;
}