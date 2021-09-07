import { Field, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
  JoinColumn,
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
  repo!: string;

  @Field()
  @Column()
  permalink!: string; // eg. https://github.com/trewjames/sourcetype/blob/2f2420286f4e555e1715af286e4843eab5a92ea0/src/index.tsx#L7

  @Field()
  @Column()
  tabsize!: number;

  @Field()
  @Column("text", { unique: true })
  snippet!: string;

  @Field()
  @ManyToOne(() => Language, (language) => language.codes)
  @JoinColumn({ name: "language_id" })
  language!: Language;
}
