import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Language } from "./Language";

@Entity()
export class Code {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  repo_url!: string;

  @Column()
  line_url!: string; // eg. https://github.com/trewjames/sourcetype/blob/2f2420286f4e555e1715af286e4843eab5a92ea0/src/index.tsx#L7

  @PrimaryColumn("text")
  snippet!: string;

  @ManyToOne(() => Language, (language) => language.snippets)
  language: Language;
}
