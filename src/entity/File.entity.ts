import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuid } from "uuid";

@Entity({
    name: 'files'
})
export class File extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string = uuid();

    @Column({
        name: 'actual_name'
    })
    actualName: string;

    @Column()
    path: string;

    @Column()
    ext: string;
}