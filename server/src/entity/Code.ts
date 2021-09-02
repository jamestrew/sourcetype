import { Field, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  PrimaryColumn,
  BaseEntity,
} from "typeorm";
import { Language } from "./Language";

@ObjectType()
@Entity()
export class Code extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  repoUrl!: string;

  @Field()
  @Column()
  lineUrl!: string; // eg. https://github.com/trewjames/sourcetype/blob/2f2420286f4e555e1715af286e4843eab5a92ea0/src/index.tsx#L7

  @Field()
  @Column("text", { unique: true })
  snippet!: string;

  @ManyToOne(() => Language, (language) => language.snippets)
  language: Language;
}
