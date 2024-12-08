import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cedente {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column()
  id_codigo_banco: string;
  @Column()
  conta_numero: string;
  @Column()
  conta_numero_dv: string;
  @Column()
  convenio_numero: string;
  @Column()
  codigo_banco: string;
}
