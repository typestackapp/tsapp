
                import { DeepRequired } from 'utility-types'
                import { Packages } from '../config'
    
                import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: Date;
  Object: any;
  ObjectId: any;
  Packages: Packages;
}

export interface IAccessDocument extends IAccessInput, IMongoTimeStamps {
  action?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  created_by?: Maybe<Scalars['ObjectId']>;
  pack: Scalars['Packages'];
  permissions: Array<IPermissionType>;
  resource: Scalars['String'];
  status: IAccessStatus;
  updatedAt: Scalars['DateTime'];
  updated_by?: Maybe<Scalars['ObjectId']>;
}

export interface IAccessInput {
  action?: Maybe<Scalars['String']>;
  created_by?: Maybe<Scalars['ObjectId']>;
  pack: Scalars['Packages'];
  permissions: Array<IPermissionType>;
  resource: Scalars['String'];
  status: IAccessStatus;
  updated_by?: Maybe<Scalars['ObjectId']>;
}

export interface IAccessOptions extends IEnabled {
  action: Scalars['String'];
  auth?: Maybe<IAuthOptions>;
  captcha?: Maybe<ICaptchaOptions>;
  config?: Maybe<Scalars['String']>;
  enabled: Scalars['Boolean'];
  limit?: Maybe<ILimitOptions>;
  log: ILogOptions;
  pack: Scalars['Packages'];
  resource: Scalars['String'];
  resourceAction: Scalars['String'];
  type?: Maybe<ITypeOptions>;
  types?: Maybe<Array<IAccessType>>;
}

export type IAccessStatus =
  | 'Disabled'
  | 'DisabledByUser'
  | 'Enabled'
  | 'EnabledByUser';

export interface IAccessType {
  info?: Maybe<Array<Scalars['String']>>;
  pack: Scalars['Packages'];
  path: Scalars['String'];
  type: Scalars['String'];
}

export interface IAuthOptions {
  authParamKeyName?: Maybe<Scalars['String']>;
  enabled: Scalars['Boolean'];
  permission?: Maybe<IPermissionType>;
  tokens: Array<ITokenType>;
}

export interface ICaptchaOptions {
  enabled: Scalars['Boolean'];
  pack: Scalars['Packages'];
  type: Scalars['String'];
}

export interface IConfigBase {
  _id?: Maybe<Scalars['ObjectId']>;
  created_by: Scalars['ObjectId'];
  data?: Maybe<Scalars['Object']>;
  title: Scalars['String'];
  updated_by: Scalars['ObjectId'];
}

export interface IConfigDocument {
  _id?: Maybe<Scalars['ObjectId']>;
  created_by: Scalars['ObjectId'];
  data?: Maybe<Scalars['Object']>;
  log: ILogOptionsDocument;
  pack: Scalars['Packages'];
  title: Scalars['String'];
  type: Scalars['String'];
  updated_by: Scalars['ObjectId'];
}

export interface IConfigDocumentBase {
  log: ILogOptionsDocument;
  pack: Scalars['Packages'];
  type: Scalars['String'];
}

export interface IConfigInput {
  _id?: Maybe<Scalars['ObjectId']>;
  created_by: Scalars['ObjectId'];
  data?: Maybe<Scalars['Object']>;
  log?: Maybe<ILogOptionsInput>;
  title: Scalars['String'];
  updated_by: Scalars['ObjectId'];
}

export interface IConfigOutput extends IMongoTimeStamps {
  _id?: Maybe<Scalars['ObjectId']>;
  createdAt: Scalars['DateTime'];
  created_by: Scalars['ObjectId'];
  data?: Maybe<Scalars['Object']>;
  log: ILogOptionsDocument;
  pack: Scalars['Packages'];
  title: Scalars['String'];
  type: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  updated_by: Scalars['ObjectId'];
}

export interface IConfigPagination extends IPagination {
  list: Array<IConfigSearch>;
  total?: Maybe<Scalars['Int']>;
}

export interface IConfigSearch extends IMongoTimeStamps, ISearchScore {
  _id?: Maybe<Scalars['ObjectId']>;
  createdAt: Scalars['DateTime'];
  created_by: Scalars['ObjectId'];
  data?: Maybe<Scalars['Object']>;
  log: ILogOptionsDocument;
  pack: Scalars['Packages'];
  score?: Maybe<Scalars['Float']>;
  title: Scalars['String'];
  type: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  updated_by: Scalars['ObjectId'];
}

export interface ICountryDocument extends ICountryInput {
  alpha2: Scalars['String'];
  alpha3: Scalars['String'];
  area?: Maybe<Scalars['Int']>;
  gdp?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  phone: Scalars['String'];
  population?: Maybe<Scalars['Int']>;
  priority?: Maybe<Scalars['Int']>;
  timezones: Array<ITimeZoneDocument>;
}

export interface ICountryInput {
  alpha2: Scalars['String'];
  alpha3: Scalars['String'];
  area?: Maybe<Scalars['Int']>;
  gdp?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  phone: Scalars['String'];
  population?: Maybe<Scalars['Int']>;
  priority?: Maybe<Scalars['Int']>;
}

export interface ICountryPagination extends IPagination {
  list: Array<ICountrySearch>;
  total?: Maybe<Scalars['Int']>;
}

export interface ICountrySearch extends ISearchScore {
  alpha2: Scalars['String'];
  alpha3: Scalars['String'];
  area?: Maybe<Scalars['Int']>;
  gdp?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  phone: Scalars['String'];
  population?: Maybe<Scalars['Int']>;
  priority?: Maybe<Scalars['Int']>;
  score?: Maybe<Scalars['Float']>;
  timezones: Array<ITimeZoneDocument>;
}

export interface ICountryUpdate {
  alpha2?: InputMaybe<Scalars['String']>;
  alpha3?: InputMaybe<Scalars['String']>;
  area?: InputMaybe<Scalars['Int']>;
  gdp?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['String']>;
  population?: InputMaybe<Scalars['Int']>;
  priority?: InputMaybe<Scalars['Int']>;
}

export interface IDefaultAccessOptions {
  action: Scalars['String'];
  pack: Scalars['Packages'];
  resource: Scalars['String'];
  resourceAction: Scalars['String'];
  types?: Maybe<Array<IAccessType>>;
}

export interface IEnabled {
  enabled: Scalars['Boolean'];
}

export type IExpressMethod =
  | 'all'
  | 'delete'
  | 'get'
  | 'head'
  | 'options'
  | 'patch'
  | 'post'
  | 'put'
  | 'use';

export interface IGraphqlAccess {
  pack: Scalars['Packages'];
  services: Array<Scalars['String']>;
}

export type IGraphqlMethod =
  | 'Mutation'
  | 'Query'
  | 'Subscription';

export interface IJobActionDocument extends IJobActionInput, IMongoId, IMongoTimeStamps {
  _id: Scalars['ObjectId'];
  createdAt: Scalars['DateTime'];
  job_id?: Maybe<Scalars['ObjectId']>;
  steps: Array<IJobStepInput>;
  updatedAt: Scalars['DateTime'];
}

export interface IJobActionInput {
  job_id?: Maybe<Scalars['ObjectId']>;
  steps: Array<IJobStepInput>;
}

export interface IJobActionPagination extends IPagination {
  list: Array<IJobActionSearch>;
  total?: Maybe<Scalars['Int']>;
}

export interface IJobActionSearch extends IJobActionInput, IMongoId, IMongoTimeStamps, ISearchScore {
  _id: Scalars['ObjectId'];
  createdAt: Scalars['DateTime'];
  job_id?: Maybe<Scalars['ObjectId']>;
  score?: Maybe<Scalars['Float']>;
  steps: Array<IJobStepInput>;
  updatedAt: Scalars['DateTime'];
}

export interface IJobBase {
  created_by: Scalars['ObjectId'];
  cron?: Maybe<Scalars['String']>;
  data?: Maybe<Scalars['Object']>;
  description: Scalars['String'];
  params: Scalars['Object'];
  parent_id?: Maybe<Scalars['ObjectId']>;
  status: IJobStatus;
  updated_by: Scalars['ObjectId'];
}

export interface IJobDocument extends IJobBase, IMongoId, IMongoTimeStamps {
  _id: Scalars['ObjectId'];
  createdAt: Scalars['DateTime'];
  created_by: Scalars['ObjectId'];
  cron?: Maybe<Scalars['String']>;
  data?: Maybe<Scalars['Object']>;
  description: Scalars['String'];
  error?: Maybe<Scalars['String']>;
  log: ILogOptionsDocument;
  pack: Scalars['Packages'];
  params: Scalars['Object'];
  parent_id?: Maybe<Scalars['ObjectId']>;
  run_on_startup: Scalars['Boolean'];
  status: IJobStatus;
  time_zone: Scalars['String'];
  type: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  updated_by: Scalars['ObjectId'];
}

export interface IJobInput {
  created_by: Scalars['ObjectId'];
  cron?: Maybe<Scalars['String']>;
  data?: Maybe<Scalars['Object']>;
  description: Scalars['String'];
  log?: Maybe<ILogOptionsInput>;
  params: Scalars['Object'];
  parent_id?: Maybe<Scalars['ObjectId']>;
  run_on_startup?: Maybe<Scalars['Boolean']>;
  status: IJobStatus;
  time_zone?: Maybe<Scalars['String']>;
  updated_by: Scalars['ObjectId'];
}

export interface IJobPagination extends IPagination {
  list: Array<IJobSearch>;
  total?: Maybe<Scalars['Int']>;
}

export interface IJobSearch extends IJobBase, IJobInput, IMongoId, IMongoTimeStamps, ISearchScore {
  _id: Scalars['ObjectId'];
  createdAt: Scalars['DateTime'];
  created_by: Scalars['ObjectId'];
  cron?: Maybe<Scalars['String']>;
  data?: Maybe<Scalars['Object']>;
  description: Scalars['String'];
  log?: Maybe<ILogOptionsInput>;
  params: Scalars['Object'];
  parent_id?: Maybe<Scalars['ObjectId']>;
  run_on_startup?: Maybe<Scalars['Boolean']>;
  score?: Maybe<Scalars['Float']>;
  status: IJobStatus;
  time_zone?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  updated_by: Scalars['ObjectId'];
}

export type IJobStatus =
  | 'Active'
  | 'Disabled'
  | 'Error'
  | 'Initilized'
  | 'Success';

export interface IJobStepInput {
  data: Scalars['Object'];
  error?: Maybe<Scalars['String']>;
  identifier: Scalars['String'];
  status: IJobStepStatus;
}

export type IJobStepStatus =
  | 'Error'
  | 'Executed'
  | 'InQueue'
  | 'Initilized';

export interface ILimitOptions {
  enabled: Scalars['Boolean'];
  limitInterval: Scalars['String'];
  limitTreshold: Scalars['Int'];
}

export interface ILogOptions {
  enabled: Scalars['Boolean'];
}

export interface ILogOptionsDocument {
  enabled: Scalars['Boolean'];
  max: Scalars['Int'];
}

export interface ILogOptionsInput {
  enabled?: Maybe<Scalars['Boolean']>;
  max?: Maybe<Scalars['Int']>;
}

export interface IMongoId {
  _id: Scalars['ObjectId'];
}

export interface IMongoIdMeybe {
  _id?: Maybe<Scalars['ObjectId']>;
}

export type IMongoOperationType =
  | 'create'
  | 'createIndexes'
  | 'delete'
  | 'drop'
  | 'dropCollection'
  | 'dropDatabase'
  | 'dropIndexes'
  | 'insert'
  | 'invalidate'
  | 'modify'
  | 'refineCollectionShardKey'
  | 'rename'
  | 'replace'
  | 'reshardCollection'
  | 'shardCollection'
  | 'update';

export interface IMongoStream {
  documentKey: IMongoId;
  fullDocument?: Maybe<Scalars['Object']>;
  fullDocumentBeforeChange?: Maybe<Scalars['Object']>;
  ns: IMongoStreamNameSpace;
  operationType: IMongoOperationType;
  updateDescription?: Maybe<IMongoStreamUpdateDescription>;
}

export interface IMongoStreamInput {
  operations: Array<IMongoOperationType>;
}

export interface IMongoStreamNameSpace {
  coll?: Maybe<Scalars['String']>;
  db?: Maybe<Scalars['String']>;
}

export interface IMongoStreamUpdateDescription {
  removedFields: Array<Scalars['String']>;
  truncatedArrays: Array<Scalars['String']>;
  updatedFields: Scalars['Object'];
}

export interface IMongoTimeStamps {
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
}

export interface IMongoTimeStampsMeybe {
  createdAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
}

export interface IMongoTimeStampsType extends IMongoTimeStamps {
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
}

export interface IMongoUpdateRes {
  acknowledged?: Maybe<Scalars['Boolean']>;
  matchedCount?: Maybe<Scalars['Int']>;
  modifiedCount?: Maybe<Scalars['Int']>;
  upsertedCount?: Maybe<Scalars['Int']>;
  upsertedId?: Maybe<Scalars['String']>;
}

export interface IMutation {
  getPing?: Maybe<Scalars['Boolean']>;
}

export interface IMySqlRes {
  affectedRows?: Maybe<Scalars['Int']>;
  changedRows?: Maybe<Scalars['Int']>;
  fieldCount?: Maybe<Scalars['Int']>;
  insertId?: Maybe<Scalars['Int']>;
  message?: Maybe<Scalars['String']>;
  protocol41?: Maybe<Scalars['Boolean']>;
  serverStatus?: Maybe<Scalars['Int']>;
  warningCount?: Maybe<Scalars['Int']>;
}

export interface IPagination {
  total?: Maybe<Scalars['Int']>;
}

export type IPermissionType =
  | 'Delete'
  | 'Read'
  | 'Update'
  | 'Write';

export interface IQuery {
  getConfig?: Maybe<IConfigOutput>;
  getCountry?: Maybe<ICountryDocument>;
  getCurrentUser?: Maybe<IUserOutput>;
  getJob?: Maybe<IJobDocument>;
  getPing?: Maybe<Scalars['Boolean']>;
  getUser?: Maybe<IUserOutput>;
  searchConfigs?: Maybe<IConfigPagination>;
  searchCountry: Array<ICountrySearch>;
  searchJob?: Maybe<IJobPagination>;
  searchTimezone: Array<ITimeZoneSearch>;
}


export interface IQueryGetConfigArgs {
  id: Scalars['String'];
}


export interface IQueryGetCountryArgs {
  alpha2: Scalars['String'];
}


export interface IQueryGetJobArgs {
  id: Scalars['String'];
}


export interface IQueryGetUserArgs {
  id: Scalars['String'];
}


export interface IQuerySearchConfigsArgs {
  search: ISearchInput;
}


export interface IQuerySearchCountryArgs {
  list?: InputMaybe<Scalars['String']>;
  search?: InputMaybe<ISearchInput>;
}


export interface IQuerySearchJobArgs {
  search?: InputMaybe<ISearchInput>;
}


export interface IQuerySearchTimezoneArgs {
  search?: InputMaybe<ISearchInput>;
}

export interface IRoleConfigDataDocument {
  graphql_access: Array<IGraphqlAccess>;
  name: Scalars['String'];
  resource_access: Array<IAccessDocument>;
}

export interface IRoleConfigDataInput {
  graphql_access: Array<IGraphqlAccess>;
  name: Scalars['String'];
  resource_access: Array<IAccessInput>;
}

export interface IRoleConfigDocument {
  _id?: Maybe<Scalars['ObjectId']>;
  created_by: Scalars['ObjectId'];
  data: IRoleConfigDataDocument;
  log: ILogOptionsDocument;
  pack: Scalars['Packages'];
  title: Scalars['String'];
  type: Scalars['String'];
  updated_by: Scalars['ObjectId'];
}

export interface IRoleConfigInput {
  _id?: Maybe<Scalars['ObjectId']>;
  created_by: Scalars['ObjectId'];
  data: IRoleConfigDataInput;
  log?: Maybe<ILogOptionsInput>;
  title: Scalars['String'];
  updated_by: Scalars['ObjectId'];
}

export interface ISearchInput {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  text: Scalars['String'];
}

export interface ISearchScore {
  score?: Maybe<Scalars['Float']>;
}

export interface IServerAccess {
  path: Array<Scalars['String']>;
  serverMethod: IServerMethod;
  serverType: IServerType;
}

export type IServerMethod =
  | 'Mutation'
  | 'Query'
  | 'Subscription'
  | 'all'
  | 'delete'
  | 'get'
  | 'head'
  | 'options'
  | 'patch'
  | 'post'
  | 'put'
  | 'use';

export type IServerType =
  | 'EXPRESS'
  | 'GRAPHQL';

export interface ISubscription {
  getPing?: Maybe<Scalars['Boolean']>;
  streamConfig?: Maybe<IMongoStream>;
  streamJob?: Maybe<IMongoStream>;
  streamJobAction?: Maybe<IMongoStream>;
}


export interface ISubscriptionStreamConfigArgs {
  stream: IMongoStreamInput;
}


export interface ISubscriptionStreamJobArgs {
  stream: IMongoStreamInput;
}


export interface ISubscriptionStreamJobActionArgs {
  stream: IMongoStreamInput;
}

export interface ITimeZoneDocument extends ITimeZoneInput {
  alpha2?: Maybe<Scalars['String']>;
  dst: Scalars['String'];
  name: Scalars['String'];
  std: Scalars['String'];
}

export interface ITimeZoneInput {
  alpha2?: Maybe<Scalars['String']>;
  dst: Scalars['String'];
  name: Scalars['String'];
  std: Scalars['String'];
}

export interface ITimeZonePagination extends IPagination {
  list: Array<ITimeZoneSearch>;
  total?: Maybe<Scalars['Int']>;
}

export interface ITimeZoneSearch extends ISearchScore {
  alpha2?: Maybe<Scalars['String']>;
  dst: Scalars['String'];
  name: Scalars['String'];
  score?: Maybe<Scalars['Float']>;
  std: Scalars['String'];
}

export type ITokenType =
  | 'ApiKey'
  | 'Basic'
  | 'Bearer';

export interface ITypeOptions {
  mongoose?: Maybe<Scalars['String']>;
}

export interface IUserDocument extends IMongoId, IMongoTimeStamps {
  _id: Scalars['ObjectId'];
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  psw: Scalars['String'];
  role: Scalars['String'];
  updatedAt: Scalars['DateTime'];
}

export interface IUserInput {
  _id?: Maybe<Scalars['ObjectId']>;
  email: Scalars['String'];
  psw: Scalars['String'];
  role: Scalars['String'];
}

export interface IUserOutput extends IMongoId, IMongoTimeStamps {
  _id: Scalars['ObjectId'];
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  role?: Maybe<IRoleConfigDocument>;
  updatedAt: Scalars['DateTime'];
}

export type IGetAdminUserDataQueryVariables = Exact<{ [key: string]: never; }>;


export type IGetAdminUserDataQuery = { getCurrentUser?: { _id: any, email: string, role?: { _id?: any | null, title: string, pack: Packages, type: string, data: { name: string, resource_access: Array<{ status: IAccessStatus, pack: Packages, resource: string, action?: string | null, permissions: Array<IPermissionType> }>, graphql_access: Array<{ pack: Packages, services: Array<string> }> } } | null } | null };



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type IResolversTypes = {
  AccessDocument: ResolverTypeWrapper<IAccessDocument>;
  AccessInput: IResolversTypes['AccessDocument'];
  AccessOptions: ResolverTypeWrapper<IAccessOptions>;
  AccessStatus: IAccessStatus;
  AccessType: never;
  AuthOptions: never;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CaptchaOptions: never;
  ConfigBase: ResolverTypeWrapper<IConfigBase>;
  ConfigDocument: ResolverTypeWrapper<IConfigDocument>;
  ConfigDocumentBase: ResolverTypeWrapper<IConfigDocumentBase>;
  ConfigInput: ResolverTypeWrapper<IConfigInput>;
  ConfigOutput: ResolverTypeWrapper<IConfigOutput>;
  ConfigPagination: ResolverTypeWrapper<IConfigPagination>;
  ConfigSearch: ResolverTypeWrapper<IConfigSearch>;
  CountryDocument: ResolverTypeWrapper<ICountryDocument>;
  CountryInput: IResolversTypes['CountryDocument'];
  CountryPagination: ResolverTypeWrapper<ICountryPagination>;
  CountrySearch: ResolverTypeWrapper<ICountrySearch>;
  CountryUpdate: ICountryUpdate;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  DefaultAccessOptions: never;
  Enabled: IResolversTypes['AccessOptions'];
  ExpressMethod: IExpressMethod;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  GraphqlAccess: ResolverTypeWrapper<IGraphqlAccess>;
  GraphqlMethod: IGraphqlMethod;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  JobActionDocument: ResolverTypeWrapper<IJobActionDocument>;
  JobActionInput: IResolversTypes['JobActionDocument'] | IResolversTypes['JobActionSearch'];
  JobActionPagination: ResolverTypeWrapper<IJobActionPagination>;
  JobActionSearch: ResolverTypeWrapper<IJobActionSearch>;
  JobBase: IResolversTypes['JobDocument'] | IResolversTypes['JobSearch'];
  JobDocument: ResolverTypeWrapper<IJobDocument>;
  JobInput: IResolversTypes['JobSearch'];
  JobPagination: ResolverTypeWrapper<IJobPagination>;
  JobSearch: ResolverTypeWrapper<IJobSearch>;
  JobStatus: IJobStatus;
  JobStepInput: never;
  JobStepStatus: IJobStepStatus;
  LimitOptions: never;
  LogOptions: never;
  LogOptionsDocument: never;
  LogOptionsInput: never;
  MongoId: IResolversTypes['JobActionDocument'] | IResolversTypes['JobActionSearch'] | IResolversTypes['JobDocument'] | IResolversTypes['JobSearch'] | IResolversTypes['UserDocument'] | IResolversTypes['UserOutput'];
  MongoIdMeybe: never;
  MongoOperationType: IMongoOperationType;
  MongoStream: ResolverTypeWrapper<IMongoStream>;
  MongoStreamInput: IMongoStreamInput;
  MongoStreamNameSpace: ResolverTypeWrapper<IMongoStreamNameSpace>;
  MongoStreamUpdateDescription: ResolverTypeWrapper<IMongoStreamUpdateDescription>;
  MongoTimeStamps: IResolversTypes['AccessDocument'] | IResolversTypes['ConfigOutput'] | IResolversTypes['ConfigSearch'] | IResolversTypes['JobActionDocument'] | IResolversTypes['JobActionSearch'] | IResolversTypes['JobDocument'] | IResolversTypes['JobSearch'] | IResolversTypes['MongoTimeStampsType'] | IResolversTypes['UserDocument'] | IResolversTypes['UserOutput'];
  MongoTimeStampsMeybe: never;
  MongoTimeStampsType: ResolverTypeWrapper<IMongoTimeStampsType>;
  MongoUpdateRes: ResolverTypeWrapper<IMongoUpdateRes>;
  Mutation: ResolverTypeWrapper<{}>;
  MySqlRes: ResolverTypeWrapper<IMySqlRes>;
  Object: ResolverTypeWrapper<Scalars['Object']>;
  ObjectId: ResolverTypeWrapper<Scalars['ObjectId']>;
  Packages: ResolverTypeWrapper<Scalars['Packages']>;
  Pagination: IResolversTypes['ConfigPagination'] | IResolversTypes['CountryPagination'] | IResolversTypes['JobActionPagination'] | IResolversTypes['JobPagination'] | IResolversTypes['TimeZonePagination'];
  PermissionType: IPermissionType;
  Query: ResolverTypeWrapper<{}>;
  RoleConfigDataDocument: ResolverTypeWrapper<IRoleConfigDataDocument>;
  RoleConfigDataInput: ResolverTypeWrapper<IRoleConfigDataInput>;
  RoleConfigDocument: ResolverTypeWrapper<IRoleConfigDocument>;
  RoleConfigInput: ResolverTypeWrapper<IRoleConfigInput>;
  SearchInput: ISearchInput;
  SearchScore: IResolversTypes['ConfigSearch'] | IResolversTypes['CountrySearch'] | IResolversTypes['JobActionSearch'] | IResolversTypes['JobSearch'] | IResolversTypes['TimeZoneSearch'];
  ServerAccess: never;
  ServerMethod: IServerMethod;
  ServerType: IServerType;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  TimeZoneDocument: ResolverTypeWrapper<ITimeZoneDocument>;
  TimeZoneInput: IResolversTypes['TimeZoneDocument'];
  TimeZonePagination: ResolverTypeWrapper<ITimeZonePagination>;
  TimeZoneSearch: ResolverTypeWrapper<ITimeZoneSearch>;
  TokenType: ITokenType;
  TypeOptions: never;
  UserDocument: ResolverTypeWrapper<IUserDocument>;
  UserInput: never;
  UserOutput: ResolverTypeWrapper<IUserOutput>;
};

/** Mapping between all available schema types and the resolvers parents */
export type IResolversParentTypes = {
  AccessDocument: IAccessDocument;
  AccessInput: IResolversParentTypes['AccessDocument'];
  AccessOptions: IAccessOptions;
  AccessType: never;
  AuthOptions: never;
  Boolean: Scalars['Boolean'];
  CaptchaOptions: never;
  ConfigBase: IConfigBase;
  ConfigDocument: IConfigDocument;
  ConfigDocumentBase: IConfigDocumentBase;
  ConfigInput: IConfigInput;
  ConfigOutput: IConfigOutput;
  ConfigPagination: IConfigPagination;
  ConfigSearch: IConfigSearch;
  CountryDocument: ICountryDocument;
  CountryInput: IResolversParentTypes['CountryDocument'];
  CountryPagination: ICountryPagination;
  CountrySearch: ICountrySearch;
  CountryUpdate: ICountryUpdate;
  DateTime: Scalars['DateTime'];
  DefaultAccessOptions: never;
  Enabled: IResolversParentTypes['AccessOptions'];
  Float: Scalars['Float'];
  GraphqlAccess: IGraphqlAccess;
  Int: Scalars['Int'];
  JobActionDocument: IJobActionDocument;
  JobActionInput: IResolversParentTypes['JobActionDocument'] | IResolversParentTypes['JobActionSearch'];
  JobActionPagination: IJobActionPagination;
  JobActionSearch: IJobActionSearch;
  JobBase: IResolversParentTypes['JobDocument'] | IResolversParentTypes['JobSearch'];
  JobDocument: IJobDocument;
  JobInput: IResolversParentTypes['JobSearch'];
  JobPagination: IJobPagination;
  JobSearch: IJobSearch;
  JobStepInput: never;
  LimitOptions: never;
  LogOptions: never;
  LogOptionsDocument: never;
  LogOptionsInput: never;
  MongoId: IResolversParentTypes['JobActionDocument'] | IResolversParentTypes['JobActionSearch'] | IResolversParentTypes['JobDocument'] | IResolversParentTypes['JobSearch'] | IResolversParentTypes['UserDocument'] | IResolversParentTypes['UserOutput'];
  MongoIdMeybe: never;
  MongoStream: IMongoStream;
  MongoStreamInput: IMongoStreamInput;
  MongoStreamNameSpace: IMongoStreamNameSpace;
  MongoStreamUpdateDescription: IMongoStreamUpdateDescription;
  MongoTimeStamps: IResolversParentTypes['AccessDocument'] | IResolversParentTypes['ConfigOutput'] | IResolversParentTypes['ConfigSearch'] | IResolversParentTypes['JobActionDocument'] | IResolversParentTypes['JobActionSearch'] | IResolversParentTypes['JobDocument'] | IResolversParentTypes['JobSearch'] | IResolversParentTypes['MongoTimeStampsType'] | IResolversParentTypes['UserDocument'] | IResolversParentTypes['UserOutput'];
  MongoTimeStampsMeybe: never;
  MongoTimeStampsType: IMongoTimeStampsType;
  MongoUpdateRes: IMongoUpdateRes;
  Mutation: {};
  MySqlRes: IMySqlRes;
  Object: Scalars['Object'];
  ObjectId: Scalars['ObjectId'];
  Packages: Scalars['Packages'];
  Pagination: IResolversParentTypes['ConfigPagination'] | IResolversParentTypes['CountryPagination'] | IResolversParentTypes['JobActionPagination'] | IResolversParentTypes['JobPagination'] | IResolversParentTypes['TimeZonePagination'];
  Query: {};
  RoleConfigDataDocument: IRoleConfigDataDocument;
  RoleConfigDataInput: IRoleConfigDataInput;
  RoleConfigDocument: IRoleConfigDocument;
  RoleConfigInput: IRoleConfigInput;
  SearchInput: ISearchInput;
  SearchScore: IResolversParentTypes['ConfigSearch'] | IResolversParentTypes['CountrySearch'] | IResolversParentTypes['JobActionSearch'] | IResolversParentTypes['JobSearch'] | IResolversParentTypes['TimeZoneSearch'];
  ServerAccess: never;
  String: Scalars['String'];
  Subscription: {};
  TimeZoneDocument: ITimeZoneDocument;
  TimeZoneInput: IResolversParentTypes['TimeZoneDocument'];
  TimeZonePagination: ITimeZonePagination;
  TimeZoneSearch: ITimeZoneSearch;
  TypeOptions: never;
  UserDocument: IUserDocument;
  UserInput: never;
  UserOutput: IUserOutput;
};

export type IAccessDocumentResolvers<ContextType = any, ParentType extends IResolversParentTypes['AccessDocument'] = IResolversParentTypes['AccessDocument']> = {
  action?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  created_by?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  pack?: Resolver<IResolversTypes['Packages'], ParentType, ContextType>;
  permissions?: Resolver<Array<IResolversTypes['PermissionType']>, ParentType, ContextType>;
  resource?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<IResolversTypes['AccessStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  updated_by?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IAccessInputResolvers<ContextType = any, ParentType extends IResolversParentTypes['AccessInput'] = IResolversParentTypes['AccessInput']> = {
  __resolveType: TypeResolveFn<'AccessDocument', ParentType, ContextType>;
  action?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  created_by?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  pack?: Resolver<IResolversTypes['Packages'], ParentType, ContextType>;
  permissions?: Resolver<Array<IResolversTypes['PermissionType']>, ParentType, ContextType>;
  resource?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<IResolversTypes['AccessStatus'], ParentType, ContextType>;
  updated_by?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
};

export type IAccessOptionsResolvers<ContextType = any, ParentType extends IResolversParentTypes['AccessOptions'] = IResolversParentTypes['AccessOptions']> = {
  action?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  auth?: Resolver<Maybe<IResolversTypes['AuthOptions']>, ParentType, ContextType>;
  captcha?: Resolver<Maybe<IResolversTypes['CaptchaOptions']>, ParentType, ContextType>;
  config?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  enabled?: Resolver<IResolversTypes['Boolean'], ParentType, ContextType>;
  limit?: Resolver<Maybe<IResolversTypes['LimitOptions']>, ParentType, ContextType>;
  log?: Resolver<IResolversTypes['LogOptions'], ParentType, ContextType>;
  pack?: Resolver<IResolversTypes['Packages'], ParentType, ContextType>;
  resource?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  resourceAction?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<Maybe<IResolversTypes['TypeOptions']>, ParentType, ContextType>;
  types?: Resolver<Maybe<Array<IResolversTypes['AccessType']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IAccessTypeResolvers<ContextType = any, ParentType extends IResolversParentTypes['AccessType'] = IResolversParentTypes['AccessType']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  info?: Resolver<Maybe<Array<IResolversTypes['String']>>, ParentType, ContextType>;
  pack?: Resolver<IResolversTypes['Packages'], ParentType, ContextType>;
  path?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
};

export type IAuthOptionsResolvers<ContextType = any, ParentType extends IResolversParentTypes['AuthOptions'] = IResolversParentTypes['AuthOptions']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  authParamKeyName?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  enabled?: Resolver<IResolversTypes['Boolean'], ParentType, ContextType>;
  permission?: Resolver<Maybe<IResolversTypes['PermissionType']>, ParentType, ContextType>;
  tokens?: Resolver<Array<IResolversTypes['TokenType']>, ParentType, ContextType>;
};

export type ICaptchaOptionsResolvers<ContextType = any, ParentType extends IResolversParentTypes['CaptchaOptions'] = IResolversParentTypes['CaptchaOptions']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  enabled?: Resolver<IResolversTypes['Boolean'], ParentType, ContextType>;
  pack?: Resolver<IResolversTypes['Packages'], ParentType, ContextType>;
  type?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
};

export type IConfigBaseResolvers<ContextType = any, ParentType extends IResolversParentTypes['ConfigBase'] = IResolversParentTypes['ConfigBase']> = {
  _id?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  created_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  data?: Resolver<Maybe<IResolversTypes['Object']>, ParentType, ContextType>;
  title?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  updated_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IConfigDocumentResolvers<ContextType = any, ParentType extends IResolversParentTypes['ConfigDocument'] = IResolversParentTypes['ConfigDocument']> = {
  _id?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  created_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  data?: Resolver<Maybe<IResolversTypes['Object']>, ParentType, ContextType>;
  log?: Resolver<IResolversTypes['LogOptionsDocument'], ParentType, ContextType>;
  pack?: Resolver<IResolversTypes['Packages'], ParentType, ContextType>;
  title?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  updated_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IConfigDocumentBaseResolvers<ContextType = any, ParentType extends IResolversParentTypes['ConfigDocumentBase'] = IResolversParentTypes['ConfigDocumentBase']> = {
  log?: Resolver<IResolversTypes['LogOptionsDocument'], ParentType, ContextType>;
  pack?: Resolver<IResolversTypes['Packages'], ParentType, ContextType>;
  type?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IConfigInputResolvers<ContextType = any, ParentType extends IResolversParentTypes['ConfigInput'] = IResolversParentTypes['ConfigInput']> = {
  _id?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  created_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  data?: Resolver<Maybe<IResolversTypes['Object']>, ParentType, ContextType>;
  log?: Resolver<Maybe<IResolversTypes['LogOptionsInput']>, ParentType, ContextType>;
  title?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  updated_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IConfigOutputResolvers<ContextType = any, ParentType extends IResolversParentTypes['ConfigOutput'] = IResolversParentTypes['ConfigOutput']> = {
  _id?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  createdAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  created_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  data?: Resolver<Maybe<IResolversTypes['Object']>, ParentType, ContextType>;
  log?: Resolver<IResolversTypes['LogOptionsDocument'], ParentType, ContextType>;
  pack?: Resolver<IResolversTypes['Packages'], ParentType, ContextType>;
  title?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  updated_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IConfigPaginationResolvers<ContextType = any, ParentType extends IResolversParentTypes['ConfigPagination'] = IResolversParentTypes['ConfigPagination']> = {
  list?: Resolver<Array<IResolversTypes['ConfigSearch']>, ParentType, ContextType>;
  total?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IConfigSearchResolvers<ContextType = any, ParentType extends IResolversParentTypes['ConfigSearch'] = IResolversParentTypes['ConfigSearch']> = {
  _id?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  createdAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  created_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  data?: Resolver<Maybe<IResolversTypes['Object']>, ParentType, ContextType>;
  log?: Resolver<IResolversTypes['LogOptionsDocument'], ParentType, ContextType>;
  pack?: Resolver<IResolversTypes['Packages'], ParentType, ContextType>;
  score?: Resolver<Maybe<IResolversTypes['Float']>, ParentType, ContextType>;
  title?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  updated_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ICountryDocumentResolvers<ContextType = any, ParentType extends IResolversParentTypes['CountryDocument'] = IResolversParentTypes['CountryDocument']> = {
  alpha2?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  alpha3?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  area?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  gdp?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  phone?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  population?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  priority?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  timezones?: Resolver<Array<IResolversTypes['TimeZoneDocument']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ICountryInputResolvers<ContextType = any, ParentType extends IResolversParentTypes['CountryInput'] = IResolversParentTypes['CountryInput']> = {
  __resolveType: TypeResolveFn<'CountryDocument', ParentType, ContextType>;
  alpha2?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  alpha3?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  area?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  gdp?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  phone?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  population?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  priority?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
};

export type ICountryPaginationResolvers<ContextType = any, ParentType extends IResolversParentTypes['CountryPagination'] = IResolversParentTypes['CountryPagination']> = {
  list?: Resolver<Array<IResolversTypes['CountrySearch']>, ParentType, ContextType>;
  total?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ICountrySearchResolvers<ContextType = any, ParentType extends IResolversParentTypes['CountrySearch'] = IResolversParentTypes['CountrySearch']> = {
  alpha2?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  alpha3?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  area?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  gdp?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  phone?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  population?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  priority?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  score?: Resolver<Maybe<IResolversTypes['Float']>, ParentType, ContextType>;
  timezones?: Resolver<Array<IResolversTypes['TimeZoneDocument']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface IDateTimeScalarConfig extends GraphQLScalarTypeConfig<IResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type IDefaultAccessOptionsResolvers<ContextType = any, ParentType extends IResolversParentTypes['DefaultAccessOptions'] = IResolversParentTypes['DefaultAccessOptions']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  action?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  pack?: Resolver<IResolversTypes['Packages'], ParentType, ContextType>;
  resource?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  resourceAction?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  types?: Resolver<Maybe<Array<IResolversTypes['AccessType']>>, ParentType, ContextType>;
};

export type IEnabledResolvers<ContextType = any, ParentType extends IResolversParentTypes['Enabled'] = IResolversParentTypes['Enabled']> = {
  __resolveType: TypeResolveFn<'AccessOptions', ParentType, ContextType>;
  enabled?: Resolver<IResolversTypes['Boolean'], ParentType, ContextType>;
};

export type IGraphqlAccessResolvers<ContextType = any, ParentType extends IResolversParentTypes['GraphqlAccess'] = IResolversParentTypes['GraphqlAccess']> = {
  pack?: Resolver<IResolversTypes['Packages'], ParentType, ContextType>;
  services?: Resolver<Array<IResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IJobActionDocumentResolvers<ContextType = any, ParentType extends IResolversParentTypes['JobActionDocument'] = IResolversParentTypes['JobActionDocument']> = {
  _id?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  createdAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  job_id?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  steps?: Resolver<Array<IResolversTypes['JobStepInput']>, ParentType, ContextType>;
  updatedAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IJobActionInputResolvers<ContextType = any, ParentType extends IResolversParentTypes['JobActionInput'] = IResolversParentTypes['JobActionInput']> = {
  __resolveType: TypeResolveFn<'JobActionDocument' | 'JobActionSearch', ParentType, ContextType>;
  job_id?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  steps?: Resolver<Array<IResolversTypes['JobStepInput']>, ParentType, ContextType>;
};

export type IJobActionPaginationResolvers<ContextType = any, ParentType extends IResolversParentTypes['JobActionPagination'] = IResolversParentTypes['JobActionPagination']> = {
  list?: Resolver<Array<IResolversTypes['JobActionSearch']>, ParentType, ContextType>;
  total?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IJobActionSearchResolvers<ContextType = any, ParentType extends IResolversParentTypes['JobActionSearch'] = IResolversParentTypes['JobActionSearch']> = {
  _id?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  createdAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  job_id?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  score?: Resolver<Maybe<IResolversTypes['Float']>, ParentType, ContextType>;
  steps?: Resolver<Array<IResolversTypes['JobStepInput']>, ParentType, ContextType>;
  updatedAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IJobBaseResolvers<ContextType = any, ParentType extends IResolversParentTypes['JobBase'] = IResolversParentTypes['JobBase']> = {
  __resolveType: TypeResolveFn<'JobDocument' | 'JobSearch', ParentType, ContextType>;
  created_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  cron?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  data?: Resolver<Maybe<IResolversTypes['Object']>, ParentType, ContextType>;
  description?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  params?: Resolver<IResolversTypes['Object'], ParentType, ContextType>;
  parent_id?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  status?: Resolver<IResolversTypes['JobStatus'], ParentType, ContextType>;
  updated_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
};

export type IJobDocumentResolvers<ContextType = any, ParentType extends IResolversParentTypes['JobDocument'] = IResolversParentTypes['JobDocument']> = {
  _id?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  createdAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  created_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  cron?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  data?: Resolver<Maybe<IResolversTypes['Object']>, ParentType, ContextType>;
  description?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  error?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  log?: Resolver<IResolversTypes['LogOptionsDocument'], ParentType, ContextType>;
  pack?: Resolver<IResolversTypes['Packages'], ParentType, ContextType>;
  params?: Resolver<IResolversTypes['Object'], ParentType, ContextType>;
  parent_id?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  run_on_startup?: Resolver<IResolversTypes['Boolean'], ParentType, ContextType>;
  status?: Resolver<IResolversTypes['JobStatus'], ParentType, ContextType>;
  time_zone?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  updated_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IJobInputResolvers<ContextType = any, ParentType extends IResolversParentTypes['JobInput'] = IResolversParentTypes['JobInput']> = {
  __resolveType: TypeResolveFn<'JobSearch', ParentType, ContextType>;
  created_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  cron?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  data?: Resolver<Maybe<IResolversTypes['Object']>, ParentType, ContextType>;
  description?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  log?: Resolver<Maybe<IResolversTypes['LogOptionsInput']>, ParentType, ContextType>;
  params?: Resolver<IResolversTypes['Object'], ParentType, ContextType>;
  parent_id?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  run_on_startup?: Resolver<Maybe<IResolversTypes['Boolean']>, ParentType, ContextType>;
  status?: Resolver<IResolversTypes['JobStatus'], ParentType, ContextType>;
  time_zone?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  updated_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
};

export type IJobPaginationResolvers<ContextType = any, ParentType extends IResolversParentTypes['JobPagination'] = IResolversParentTypes['JobPagination']> = {
  list?: Resolver<Array<IResolversTypes['JobSearch']>, ParentType, ContextType>;
  total?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IJobSearchResolvers<ContextType = any, ParentType extends IResolversParentTypes['JobSearch'] = IResolversParentTypes['JobSearch']> = {
  _id?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  createdAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  created_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  cron?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  data?: Resolver<Maybe<IResolversTypes['Object']>, ParentType, ContextType>;
  description?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  log?: Resolver<Maybe<IResolversTypes['LogOptionsInput']>, ParentType, ContextType>;
  params?: Resolver<IResolversTypes['Object'], ParentType, ContextType>;
  parent_id?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  run_on_startup?: Resolver<Maybe<IResolversTypes['Boolean']>, ParentType, ContextType>;
  score?: Resolver<Maybe<IResolversTypes['Float']>, ParentType, ContextType>;
  status?: Resolver<IResolversTypes['JobStatus'], ParentType, ContextType>;
  time_zone?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  updated_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IJobStepInputResolvers<ContextType = any, ParentType extends IResolversParentTypes['JobStepInput'] = IResolversParentTypes['JobStepInput']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  data?: Resolver<IResolversTypes['Object'], ParentType, ContextType>;
  error?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  identifier?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<IResolversTypes['JobStepStatus'], ParentType, ContextType>;
};

export type ILimitOptionsResolvers<ContextType = any, ParentType extends IResolversParentTypes['LimitOptions'] = IResolversParentTypes['LimitOptions']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  enabled?: Resolver<IResolversTypes['Boolean'], ParentType, ContextType>;
  limitInterval?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  limitTreshold?: Resolver<IResolversTypes['Int'], ParentType, ContextType>;
};

export type ILogOptionsResolvers<ContextType = any, ParentType extends IResolversParentTypes['LogOptions'] = IResolversParentTypes['LogOptions']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  enabled?: Resolver<IResolversTypes['Boolean'], ParentType, ContextType>;
};

export type ILogOptionsDocumentResolvers<ContextType = any, ParentType extends IResolversParentTypes['LogOptionsDocument'] = IResolversParentTypes['LogOptionsDocument']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  enabled?: Resolver<IResolversTypes['Boolean'], ParentType, ContextType>;
  max?: Resolver<IResolversTypes['Int'], ParentType, ContextType>;
};

export type ILogOptionsInputResolvers<ContextType = any, ParentType extends IResolversParentTypes['LogOptionsInput'] = IResolversParentTypes['LogOptionsInput']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  enabled?: Resolver<Maybe<IResolversTypes['Boolean']>, ParentType, ContextType>;
  max?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
};

export type IMongoIdResolvers<ContextType = any, ParentType extends IResolversParentTypes['MongoId'] = IResolversParentTypes['MongoId']> = {
  __resolveType: TypeResolveFn<'JobActionDocument' | 'JobActionSearch' | 'JobDocument' | 'JobSearch' | 'UserDocument' | 'UserOutput', ParentType, ContextType>;
  _id?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
};

export type IMongoIdMeybeResolvers<ContextType = any, ParentType extends IResolversParentTypes['MongoIdMeybe'] = IResolversParentTypes['MongoIdMeybe']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  _id?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
};

export type IMongoStreamResolvers<ContextType = any, ParentType extends IResolversParentTypes['MongoStream'] = IResolversParentTypes['MongoStream']> = {
  documentKey?: Resolver<IResolversTypes['MongoId'], ParentType, ContextType>;
  fullDocument?: Resolver<Maybe<IResolversTypes['Object']>, ParentType, ContextType>;
  fullDocumentBeforeChange?: Resolver<Maybe<IResolversTypes['Object']>, ParentType, ContextType>;
  ns?: Resolver<IResolversTypes['MongoStreamNameSpace'], ParentType, ContextType>;
  operationType?: Resolver<IResolversTypes['MongoOperationType'], ParentType, ContextType>;
  updateDescription?: Resolver<Maybe<IResolversTypes['MongoStreamUpdateDescription']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IMongoStreamNameSpaceResolvers<ContextType = any, ParentType extends IResolversParentTypes['MongoStreamNameSpace'] = IResolversParentTypes['MongoStreamNameSpace']> = {
  coll?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  db?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IMongoStreamUpdateDescriptionResolvers<ContextType = any, ParentType extends IResolversParentTypes['MongoStreamUpdateDescription'] = IResolversParentTypes['MongoStreamUpdateDescription']> = {
  removedFields?: Resolver<Array<IResolversTypes['String']>, ParentType, ContextType>;
  truncatedArrays?: Resolver<Array<IResolversTypes['String']>, ParentType, ContextType>;
  updatedFields?: Resolver<IResolversTypes['Object'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IMongoTimeStampsResolvers<ContextType = any, ParentType extends IResolversParentTypes['MongoTimeStamps'] = IResolversParentTypes['MongoTimeStamps']> = {
  __resolveType: TypeResolveFn<'AccessDocument' | 'ConfigOutput' | 'ConfigSearch' | 'JobActionDocument' | 'JobActionSearch' | 'JobDocument' | 'JobSearch' | 'MongoTimeStampsType' | 'UserDocument' | 'UserOutput', ParentType, ContextType>;
  createdAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  updatedAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
};

export type IMongoTimeStampsMeybeResolvers<ContextType = any, ParentType extends IResolversParentTypes['MongoTimeStampsMeybe'] = IResolversParentTypes['MongoTimeStampsMeybe']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<IResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<IResolversTypes['DateTime']>, ParentType, ContextType>;
};

export type IMongoTimeStampsTypeResolvers<ContextType = any, ParentType extends IResolversParentTypes['MongoTimeStampsType'] = IResolversParentTypes['MongoTimeStampsType']> = {
  createdAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  updatedAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IMongoUpdateResResolvers<ContextType = any, ParentType extends IResolversParentTypes['MongoUpdateRes'] = IResolversParentTypes['MongoUpdateRes']> = {
  acknowledged?: Resolver<Maybe<IResolversTypes['Boolean']>, ParentType, ContextType>;
  matchedCount?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  modifiedCount?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  upsertedCount?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  upsertedId?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IMutationResolvers<ContextType = any, ParentType extends IResolversParentTypes['Mutation'] = IResolversParentTypes['Mutation']> = {
  getPing?: Resolver<Maybe<IResolversTypes['Boolean']>, ParentType, ContextType>;
};

export type IMySqlResResolvers<ContextType = any, ParentType extends IResolversParentTypes['MySqlRes'] = IResolversParentTypes['MySqlRes']> = {
  affectedRows?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  changedRows?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  fieldCount?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  insertId?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  message?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  protocol41?: Resolver<Maybe<IResolversTypes['Boolean']>, ParentType, ContextType>;
  serverStatus?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  warningCount?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface IObjectScalarConfig extends GraphQLScalarTypeConfig<IResolversTypes['Object'], any> {
  name: 'Object';
}

export interface IObjectIdScalarConfig extends GraphQLScalarTypeConfig<IResolversTypes['ObjectId'], any> {
  name: 'ObjectId';
}

export interface IPackagesScalarConfig extends GraphQLScalarTypeConfig<IResolversTypes['Packages'], any> {
  name: 'Packages';
}

export type IPaginationResolvers<ContextType = any, ParentType extends IResolversParentTypes['Pagination'] = IResolversParentTypes['Pagination']> = {
  __resolveType: TypeResolveFn<'ConfigPagination' | 'CountryPagination' | 'JobActionPagination' | 'JobPagination' | 'TimeZonePagination', ParentType, ContextType>;
  total?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
};

export type IQueryResolvers<ContextType = any, ParentType extends IResolversParentTypes['Query'] = IResolversParentTypes['Query']> = {
  getConfig?: Resolver<Maybe<IResolversTypes['ConfigOutput']>, ParentType, ContextType, RequireFields<IQueryGetConfigArgs, 'id'>>;
  getCountry?: Resolver<Maybe<IResolversTypes['CountryDocument']>, ParentType, ContextType, RequireFields<IQueryGetCountryArgs, 'alpha2'>>;
  getCurrentUser?: Resolver<Maybe<IResolversTypes['UserOutput']>, ParentType, ContextType>;
  getJob?: Resolver<Maybe<IResolversTypes['JobDocument']>, ParentType, ContextType, RequireFields<IQueryGetJobArgs, 'id'>>;
  getPing?: Resolver<Maybe<IResolversTypes['Boolean']>, ParentType, ContextType>;
  getUser?: Resolver<Maybe<IResolversTypes['UserOutput']>, ParentType, ContextType, RequireFields<IQueryGetUserArgs, 'id'>>;
  searchConfigs?: Resolver<Maybe<IResolversTypes['ConfigPagination']>, ParentType, ContextType, RequireFields<IQuerySearchConfigsArgs, 'search'>>;
  searchCountry?: Resolver<Array<IResolversTypes['CountrySearch']>, ParentType, ContextType, Partial<IQuerySearchCountryArgs>>;
  searchJob?: Resolver<Maybe<IResolversTypes['JobPagination']>, ParentType, ContextType, Partial<IQuerySearchJobArgs>>;
  searchTimezone?: Resolver<Array<IResolversTypes['TimeZoneSearch']>, ParentType, ContextType, Partial<IQuerySearchTimezoneArgs>>;
};

export type IRoleConfigDataDocumentResolvers<ContextType = any, ParentType extends IResolversParentTypes['RoleConfigDataDocument'] = IResolversParentTypes['RoleConfigDataDocument']> = {
  graphql_access?: Resolver<Array<IResolversTypes['GraphqlAccess']>, ParentType, ContextType>;
  name?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  resource_access?: Resolver<Array<IResolversTypes['AccessDocument']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IRoleConfigDataInputResolvers<ContextType = any, ParentType extends IResolversParentTypes['RoleConfigDataInput'] = IResolversParentTypes['RoleConfigDataInput']> = {
  graphql_access?: Resolver<Array<IResolversTypes['GraphqlAccess']>, ParentType, ContextType>;
  name?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  resource_access?: Resolver<Array<IResolversTypes['AccessInput']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IRoleConfigDocumentResolvers<ContextType = any, ParentType extends IResolversParentTypes['RoleConfigDocument'] = IResolversParentTypes['RoleConfigDocument']> = {
  _id?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  created_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  data?: Resolver<IResolversTypes['RoleConfigDataDocument'], ParentType, ContextType>;
  log?: Resolver<IResolversTypes['LogOptionsDocument'], ParentType, ContextType>;
  pack?: Resolver<IResolversTypes['Packages'], ParentType, ContextType>;
  title?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  updated_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IRoleConfigInputResolvers<ContextType = any, ParentType extends IResolversParentTypes['RoleConfigInput'] = IResolversParentTypes['RoleConfigInput']> = {
  _id?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  created_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  data?: Resolver<IResolversTypes['RoleConfigDataInput'], ParentType, ContextType>;
  log?: Resolver<Maybe<IResolversTypes['LogOptionsInput']>, ParentType, ContextType>;
  title?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  updated_by?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ISearchScoreResolvers<ContextType = any, ParentType extends IResolversParentTypes['SearchScore'] = IResolversParentTypes['SearchScore']> = {
  __resolveType: TypeResolveFn<'ConfigSearch' | 'CountrySearch' | 'JobActionSearch' | 'JobSearch' | 'TimeZoneSearch', ParentType, ContextType>;
  score?: Resolver<Maybe<IResolversTypes['Float']>, ParentType, ContextType>;
};

export type IServerAccessResolvers<ContextType = any, ParentType extends IResolversParentTypes['ServerAccess'] = IResolversParentTypes['ServerAccess']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  path?: Resolver<Array<IResolversTypes['String']>, ParentType, ContextType>;
  serverMethod?: Resolver<IResolversTypes['ServerMethod'], ParentType, ContextType>;
  serverType?: Resolver<IResolversTypes['ServerType'], ParentType, ContextType>;
};

export type ISubscriptionResolvers<ContextType = any, ParentType extends IResolversParentTypes['Subscription'] = IResolversParentTypes['Subscription']> = {
  getPing?: SubscriptionResolver<Maybe<IResolversTypes['Boolean']>, "getPing", ParentType, ContextType>;
  streamConfig?: SubscriptionResolver<Maybe<IResolversTypes['MongoStream']>, "streamConfig", ParentType, ContextType, RequireFields<ISubscriptionStreamConfigArgs, 'stream'>>;
  streamJob?: SubscriptionResolver<Maybe<IResolversTypes['MongoStream']>, "streamJob", ParentType, ContextType, RequireFields<ISubscriptionStreamJobArgs, 'stream'>>;
  streamJobAction?: SubscriptionResolver<Maybe<IResolversTypes['MongoStream']>, "streamJobAction", ParentType, ContextType, RequireFields<ISubscriptionStreamJobActionArgs, 'stream'>>;
};

export type ITimeZoneDocumentResolvers<ContextType = any, ParentType extends IResolversParentTypes['TimeZoneDocument'] = IResolversParentTypes['TimeZoneDocument']> = {
  alpha2?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  dst?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  std?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ITimeZoneInputResolvers<ContextType = any, ParentType extends IResolversParentTypes['TimeZoneInput'] = IResolversParentTypes['TimeZoneInput']> = {
  __resolveType: TypeResolveFn<'TimeZoneDocument', ParentType, ContextType>;
  alpha2?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  dst?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  std?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
};

export type ITimeZonePaginationResolvers<ContextType = any, ParentType extends IResolversParentTypes['TimeZonePagination'] = IResolversParentTypes['TimeZonePagination']> = {
  list?: Resolver<Array<IResolversTypes['TimeZoneSearch']>, ParentType, ContextType>;
  total?: Resolver<Maybe<IResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ITimeZoneSearchResolvers<ContextType = any, ParentType extends IResolversParentTypes['TimeZoneSearch'] = IResolversParentTypes['TimeZoneSearch']> = {
  alpha2?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
  dst?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  score?: Resolver<Maybe<IResolversTypes['Float']>, ParentType, ContextType>;
  std?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ITypeOptionsResolvers<ContextType = any, ParentType extends IResolversParentTypes['TypeOptions'] = IResolversParentTypes['TypeOptions']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  mongoose?: Resolver<Maybe<IResolversTypes['String']>, ParentType, ContextType>;
};

export type IUserDocumentResolvers<ContextType = any, ParentType extends IResolversParentTypes['UserDocument'] = IResolversParentTypes['UserDocument']> = {
  _id?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  createdAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  psw?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IUserInputResolvers<ContextType = any, ParentType extends IResolversParentTypes['UserInput'] = IResolversParentTypes['UserInput']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  _id?: Resolver<Maybe<IResolversTypes['ObjectId']>, ParentType, ContextType>;
  email?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  psw?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
};

export type IUserOutputResolvers<ContextType = any, ParentType extends IResolversParentTypes['UserOutput'] = IResolversParentTypes['UserOutput']> = {
  _id?: Resolver<IResolversTypes['ObjectId'], ParentType, ContextType>;
  createdAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<IResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<Maybe<IResolversTypes['RoleConfigDocument']>, ParentType, ContextType>;
  updatedAt?: Resolver<IResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IResolvers<ContextType = any> = {
  AccessDocument?: IAccessDocumentResolvers<ContextType>;
  AccessInput?: IAccessInputResolvers<ContextType>;
  AccessOptions?: IAccessOptionsResolvers<ContextType>;
  AccessType?: IAccessTypeResolvers<ContextType>;
  AuthOptions?: IAuthOptionsResolvers<ContextType>;
  CaptchaOptions?: ICaptchaOptionsResolvers<ContextType>;
  ConfigBase?: IConfigBaseResolvers<ContextType>;
  ConfigDocument?: IConfigDocumentResolvers<ContextType>;
  ConfigDocumentBase?: IConfigDocumentBaseResolvers<ContextType>;
  ConfigInput?: IConfigInputResolvers<ContextType>;
  ConfigOutput?: IConfigOutputResolvers<ContextType>;
  ConfigPagination?: IConfigPaginationResolvers<ContextType>;
  ConfigSearch?: IConfigSearchResolvers<ContextType>;
  CountryDocument?: ICountryDocumentResolvers<ContextType>;
  CountryInput?: ICountryInputResolvers<ContextType>;
  CountryPagination?: ICountryPaginationResolvers<ContextType>;
  CountrySearch?: ICountrySearchResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DefaultAccessOptions?: IDefaultAccessOptionsResolvers<ContextType>;
  Enabled?: IEnabledResolvers<ContextType>;
  GraphqlAccess?: IGraphqlAccessResolvers<ContextType>;
  JobActionDocument?: IJobActionDocumentResolvers<ContextType>;
  JobActionInput?: IJobActionInputResolvers<ContextType>;
  JobActionPagination?: IJobActionPaginationResolvers<ContextType>;
  JobActionSearch?: IJobActionSearchResolvers<ContextType>;
  JobBase?: IJobBaseResolvers<ContextType>;
  JobDocument?: IJobDocumentResolvers<ContextType>;
  JobInput?: IJobInputResolvers<ContextType>;
  JobPagination?: IJobPaginationResolvers<ContextType>;
  JobSearch?: IJobSearchResolvers<ContextType>;
  JobStepInput?: IJobStepInputResolvers<ContextType>;
  LimitOptions?: ILimitOptionsResolvers<ContextType>;
  LogOptions?: ILogOptionsResolvers<ContextType>;
  LogOptionsDocument?: ILogOptionsDocumentResolvers<ContextType>;
  LogOptionsInput?: ILogOptionsInputResolvers<ContextType>;
  MongoId?: IMongoIdResolvers<ContextType>;
  MongoIdMeybe?: IMongoIdMeybeResolvers<ContextType>;
  MongoStream?: IMongoStreamResolvers<ContextType>;
  MongoStreamNameSpace?: IMongoStreamNameSpaceResolvers<ContextType>;
  MongoStreamUpdateDescription?: IMongoStreamUpdateDescriptionResolvers<ContextType>;
  MongoTimeStamps?: IMongoTimeStampsResolvers<ContextType>;
  MongoTimeStampsMeybe?: IMongoTimeStampsMeybeResolvers<ContextType>;
  MongoTimeStampsType?: IMongoTimeStampsTypeResolvers<ContextType>;
  MongoUpdateRes?: IMongoUpdateResResolvers<ContextType>;
  Mutation?: IMutationResolvers<ContextType>;
  MySqlRes?: IMySqlResResolvers<ContextType>;
  Object?: GraphQLScalarType;
  ObjectId?: GraphQLScalarType;
  Packages?: GraphQLScalarType;
  Pagination?: IPaginationResolvers<ContextType>;
  Query?: IQueryResolvers<ContextType>;
  RoleConfigDataDocument?: IRoleConfigDataDocumentResolvers<ContextType>;
  RoleConfigDataInput?: IRoleConfigDataInputResolvers<ContextType>;
  RoleConfigDocument?: IRoleConfigDocumentResolvers<ContextType>;
  RoleConfigInput?: IRoleConfigInputResolvers<ContextType>;
  SearchScore?: ISearchScoreResolvers<ContextType>;
  ServerAccess?: IServerAccessResolvers<ContextType>;
  Subscription?: ISubscriptionResolvers<ContextType>;
  TimeZoneDocument?: ITimeZoneDocumentResolvers<ContextType>;
  TimeZoneInput?: ITimeZoneInputResolvers<ContextType>;
  TimeZonePagination?: ITimeZonePaginationResolvers<ContextType>;
  TimeZoneSearch?: ITimeZoneSearchResolvers<ContextType>;
  TypeOptions?: ITypeOptionsResolvers<ContextType>;
  UserDocument?: IUserDocumentResolvers<ContextType>;
  UserInput?: IUserInputResolvers<ContextType>;
  UserOutput?: IUserOutputResolvers<ContextType>;
};



export const GetAdminUserDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminUserData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getCurrentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"pack"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"resource_access"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pack"}},{"kind":"Field","name":{"kind":"Name","value":"resource"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}},{"kind":"Field","name":{"kind":"Name","value":"graphql_access"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pack"}},{"kind":"Field","name":{"kind":"Name","value":"services"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<IGetAdminUserDataQuery, IGetAdminUserDataQueryVariables>;
    
                // additional types generated by build-graphql.js script!
                export type GraphqlResolvers = Record<IGraphqlMethod, Record<string, any>>
    
                type GraphqlResources<T extends GraphqlResolvers> = {
                    [K in IGraphqlMethod]?: {
                        [K2 in keyof T[K]]?: IAccessOptions  
                    } 
                }
    
                export type Resources<T> = GraphqlResources<DeepRequired<IResolvers<T>>>
            