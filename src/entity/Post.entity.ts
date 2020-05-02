import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuid } from 'uuid';
import { DocType } from "../interfaces/doc-type";
import { Comment } from "./Comment.entity";
import { File } from "./File.entity";
import { User } from "./User.entity";

@Entity({
    name: 'posts'
})
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string = uuid();

    @Column()
    title: string;

    @Column({
        type: 'text',
        nullable: true
    })
    description?: string;

    @Column({
        type: 'varchar'
    })
    type: DocType = DocType.Document;

    @ManyToOne(() => User, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        nullable: true
    })
    @JoinColumn({
        name: 'author_id',
        referencedColumnName: 'id'
    })
    author?: User;

    @ManyToMany(() => File, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    @JoinTable({
        name: 'post_attachments',
        joinColumn: {
            name: 'post_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'file_id',
            referencedColumnName: 'id'
        }
    })
    attachments: File[];

    @OneToMany(() => Comment, comment => comment.post, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    })
    comments: Comment[];


    @CreateDateColumn({
        name: 'posted_at',
        type: 'timestamp'
    })
    postedAt: string;
}