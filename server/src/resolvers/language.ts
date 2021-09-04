import { Arg, Query, Resolver } from "type-graphql";
import { Language } from "../entity/Language";

@Resolver()
export class LanguageResolver {
  @Query(() => [Language])
  async languages(): Promise<Language[]> {
    return await Language.find();
  }

  @Query(() => Language, { nullable: true })
  async language(@Arg("id") id: number): Promise<Language | undefined> {
    return Language.findOne(id);
  }
}
