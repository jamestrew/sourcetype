import { GraphQLResolveInfo } from "graphql";
import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X];
} &
  { [P in K]-?: NonNullable<T[P]> };
const defaultOptions = {};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Code = {
  __typename?: "Code";
  id: Scalars["Float"];
  repo: Scalars["String"];
  permalink: Scalars["String"];
  snippet: Scalars["String"];
  language: Language;
};

export type Language = {
  __typename?: "Language";
  id: Scalars["Float"];
  name: Scalars["String"];
  ext: Scalars["String"];
};

export type Query = {
  __typename?: "Query";
  codes?: Maybe<Array<Code>>;
  code?: Maybe<Code>;
  randCodeByLang: Code;
  languages: Array<Language>;
  language?: Maybe<Language>;
};

export type QueryCodeArgs = {
  id: Scalars["Float"];
};

export type QueryRandCodeByLangArgs = {
  language_id: Scalars["Float"];
};

export type QueryLanguageArgs = {
  id: Scalars["Float"];
};

export type LanguagesQueryVariables = Exact<{ [key: string]: never }>;

export type LanguagesQuery = {
  __typename?: "Query";
  languages: Array<{
    __typename?: "Language";
    id: number;
    name: string;
    ext: string;
  }>;
};

export type RandCodeByLangQueryVariables = Exact<{
  language_id: Scalars["Float"];
}>;

export type RandCodeByLangQuery = {
  __typename?: "Query";
  randCodeByLang: {
    __typename?: "Code";
    repo: string;
    permalink: string;
    snippet: string;
    language: { __typename?: "Language"; name: string; ext: string };
  };
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Code: ResolverTypeWrapper<Code>;
  Float: ResolverTypeWrapper<Scalars["Float"]>;
  String: ResolverTypeWrapper<Scalars["String"]>;
  Language: ResolverTypeWrapper<Language>;
  Query: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Code: Code;
  Float: Scalars["Float"];
  String: Scalars["String"];
  Language: Language;
  Query: {};
  Boolean: Scalars["Boolean"];
};

export type CodeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Code"] = ResolversParentTypes["Code"]
> = {
  id?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  repo?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  permalink?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  snippet?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  language?: Resolver<ResolversTypes["Language"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LanguageResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Language"] = ResolversParentTypes["Language"]
> = {
  id?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  ext?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"]
> = {
  codes?: Resolver<
    Maybe<Array<ResolversTypes["Code"]>>,
    ParentType,
    ContextType
  >;
  code?: Resolver<
    Maybe<ResolversTypes["Code"]>,
    ParentType,
    ContextType,
    RequireFields<QueryCodeArgs, "id">
  >;
  randCodeByLang?: Resolver<
    ResolversTypes["Code"],
    ParentType,
    ContextType,
    RequireFields<QueryRandCodeByLangArgs, "language_id">
  >;
  languages?: Resolver<
    Array<ResolversTypes["Language"]>,
    ParentType,
    ContextType
  >;
  language?: Resolver<
    Maybe<ResolversTypes["Language"]>,
    ParentType,
    ContextType,
    RequireFields<QueryLanguageArgs, "id">
  >;
};

export type Resolvers<ContextType = any> = {
  Code?: CodeResolvers<ContextType>;
  Language?: LanguageResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};

export const LanguagesDocument = gql`
  query languages {
    languages {
      id
      name
      ext
    }
  }
`;

/**
 * __useLanguagesQuery__
 *
 * To run a query within a React component, call `useLanguagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useLanguagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLanguagesQuery({
 *   variables: {
 *   },
 * });
 */
export function useLanguagesQuery(
  baseOptions?: Apollo.QueryHookOptions<LanguagesQuery, LanguagesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<LanguagesQuery, LanguagesQueryVariables>(
    LanguagesDocument,
    options
  );
}
export function useLanguagesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    LanguagesQuery,
    LanguagesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<LanguagesQuery, LanguagesQueryVariables>(
    LanguagesDocument,
    options
  );
}
export type LanguagesQueryHookResult = ReturnType<typeof useLanguagesQuery>;
export type LanguagesLazyQueryHookResult = ReturnType<
  typeof useLanguagesLazyQuery
>;
export type LanguagesQueryResult = Apollo.QueryResult<
  LanguagesQuery,
  LanguagesQueryVariables
>;
export const RandCodeByLangDocument = gql`
  query randCodeByLang($language_id: Float!) {
    randCodeByLang(language_id: $language_id) {
      repo
      permalink
      snippet
      language {
        name
        ext
      }
    }
  }
`;

/**
 * __useRandCodeByLangQuery__
 *
 * To run a query within a React component, call `useRandCodeByLangQuery` and pass it any options that fit your needs.
 * When your component renders, `useRandCodeByLangQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRandCodeByLangQuery({
 *   variables: {
 *      language_id: // value for 'language_id'
 *   },
 * });
 */
export function useRandCodeByLangQuery(
  baseOptions: Apollo.QueryHookOptions<
    RandCodeByLangQuery,
    RandCodeByLangQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<RandCodeByLangQuery, RandCodeByLangQueryVariables>(
    RandCodeByLangDocument,
    options
  );
}
export function useRandCodeByLangLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    RandCodeByLangQuery,
    RandCodeByLangQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<RandCodeByLangQuery, RandCodeByLangQueryVariables>(
    RandCodeByLangDocument,
    options
  );
}
export type RandCodeByLangQueryHookResult = ReturnType<
  typeof useRandCodeByLangQuery
>;
export type RandCodeByLangLazyQueryHookResult = ReturnType<
  typeof useRandCodeByLangLazyQuery
>;
