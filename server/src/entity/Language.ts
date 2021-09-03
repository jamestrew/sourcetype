import { Field, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  BaseEntity,
  Column,
} from "typeorm";
import { Code } from "./Code";

@ObjectType()
@Entity()
export class Language extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  name!: string;

  @Field()
  @Column({ unique: true })
  ext!: string;

  @OneToMany(() => Code, (code) => code.language)
  codes: Code[];
}
