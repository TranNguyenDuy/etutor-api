import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { Roles } from "../interfaces/roles";
import { Conversation } from "./Conversation.entity";
import { File } from "./File.entity";
import { Meeting } from "./Meeting.entity";

@Entity({
  name: "users"
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string = uuid();

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: "varchar"
  })
  role: Roles;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @ManyToOne(() => User, {
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  })
  @JoinColumn({
    name: "tutor_id",
    referencedColumnName: "id"
  })
  tutor?: User;

  @OneToMany(
    () => User,
    (user: User) => user.tutor,
    {
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    }
  )
  students?: User[];

  @OneToMany(() => Conversation, (conversation) => conversation.student, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  conversationsWithTutors: Conversation[];

  @OneToMany(() => Conversation, (conversation) => conversation.tutor, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  })
  conversationsWithStudents: Conversation[];

  @ManyToOne(() => File, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true
  })
  @JoinColumn({
    name: 'avatar_id',
    referencedColumnName: 'id'
  })
  avatar?: File;

  @ManyToMany(() => Meeting)
  @JoinTable({
    name: 'user_meetings',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'meeting_id',
      referencedColumnName: 'id'
    }
  })
  meetings: Meeting[];
}
