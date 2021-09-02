import { Arg, Query, Resolver } from "type-graphql";
import { Code } from "../entity/Code";

@Resolver()
export class CodeResolver {
  @Query(() => [Code])
  async codes(): Promise<Code[]> {
    return await Code.find();
  }

  @Query(() => Code, { nullable: true })
  async code(@Arg("id") id: number): Promise<Code | undefined> {
    return Code.findOne(id);
  }
}
