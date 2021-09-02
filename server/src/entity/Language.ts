import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  PrimaryColumn,
  BaseEntity,
} from "typeorm";
import { Code } from "./Code";

@Entity()
export class Language extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  name!: string;

  @PrimaryColumn()
  ext!: string;

  @OneToMany(() => Code, (snippets) => snippets.language)
  snippets: Code[];
}
