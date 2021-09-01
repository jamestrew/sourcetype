import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { Code } from "./Code";

@Entity()
export class Language {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  language_name!: string;

  @PrimaryColumn()
  language_ext!: string;

  @OneToMany(() => Code, (snippets) => snippets.language)
  snippets: Code[];
}
