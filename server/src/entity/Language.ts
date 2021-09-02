import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  BaseEntity,
  Column,
} from "typeorm";
import { Code } from "./Code";

@Entity()
export class Language extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  ext!: string;

  @OneToMany(() => Code, (snippets) => snippets.language)
  snippets: Code[];
}
