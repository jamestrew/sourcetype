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
  name!: string;

  @PrimaryColumn()
  ext!: string;

  @OneToMany(() => Code, (snippets) => snippets.language)
  snippets: Code[];
}
