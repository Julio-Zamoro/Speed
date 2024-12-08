import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Sequence {
    @PrimaryGeneratedColumn('increment')
    id: number;
    @Column()
    name: string;
    @Column()
    sequence: number;
}