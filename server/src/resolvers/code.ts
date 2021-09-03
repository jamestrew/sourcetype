import { Arg, Query, Resolver } from "type-graphql";
import { Code } from "../entity/Code";
import { createQueryBuilder, getConnection } from "typeorm";

@Resolver()
export class CodeResolver {
  @Query(() => [Code], { nullable: true })
  async codes(): Promise<Code[] | undefined> {
    const codes = await getConnection().query(
      `
        SELECT  c.*,
                JSON_BUILD_OBJECT(
                  'id', l.id,
                  'name', l.name,
                  'ext', l.ext
                ) "language"
        FROM    code c join language l
                  on c.language_id = l.id
      `
    );
    return codes;
  }

  @Query(() => Code, { nullable: true })
  async code(@Arg("id") id: number): Promise<Code | undefined> {
    return Code.findOne(id);
  }
}
