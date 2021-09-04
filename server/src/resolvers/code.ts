import { Arg, Query, Resolver } from "type-graphql";
import { Code } from "../entity/Code";
import { getConnection } from "typeorm";

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
    const code = await getConnection().query(
      `
        SELECT  c.*,
                JSON_BUILD_OBJECT(
                  'id', l.id,
                  'name', l.name,
                  'ext', l.ext
                ) "language"
        FROM    code c join language l
                  on c.language_id = l.id
        WHERE   c.id = $1
      `,
      [id]
    );
    return code.pop();
  }

  @Query(() => Code)
  async randCodeByLang(@Arg("language_id") language_id: number): Promise<Code> {
    const code = await getConnection().query(
      `
        SELECT  c.*,
                JSON_BUILD_OBJECT(
                  'id', l.id,
                  'name', l.name,
                  'ext', l.ext
                ) "language"
        FROM    language l join code c
                  on c.language_id = l.id
        WHERE   l.id = $1
        ORDER BY RANDOM()
        LIMIT 1
      `,
      [language_id]
    );
    return code.pop();
  }
}
