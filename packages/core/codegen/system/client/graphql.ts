/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  Object: { input: any; output: any; }
  ObjectId: { input: any; output: any; }
  Packages: { input: any; output: any; }
};

export type AccessDocument = AccessInput & MongoTimeStamps & {
  __typename?: 'AccessDocument';
  action?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  created_by?: Maybe<Scalars['ObjectId']['output']>;
  pack: Scalars['Packages']['output'];
  permissions: Array<PermissionType>;
  resource: Scalars['String']['output'];
  status: AccessStatus;
  updatedAt: Scalars['DateTime']['output'];
  updated_by?: Maybe<Scalars['ObjectId']['output']>;
};

export type AccessInput = {
  action?: Maybe<Scalars['String']['output']>;
  created_by?: Maybe<Scalars['ObjectId']['output']>;
  pack: Scalars['Packages']['output'];
  permissions: Array<PermissionType>;
  resource: Scalars['String']['output'];
  status: AccessStatus;
  updated_by?: Maybe<Scalars['ObjectId']['output']>;
};

export type AccessOptions = Enabled & {
  __typename?: 'AccessOptions';
  action: Scalars['String']['output'];
  auth?: Maybe<AuthOptions>;
  captcha?: Maybe<CaptchaOptions>;
  config?: Maybe<Scalars['String']['output']>;
  enabled: Scalars['Boolean']['output'];
  limit?: Maybe<LimitOptions>;
  log: LogOptions;
  pack: Scalars['Packages']['output'];
  resource: Scalars['String']['output'];
  resourceAction: Scalars['String']['output'];
  type?: Maybe<TypeOptions>;
  types?: Maybe<Array<AccessType>>;
};

export enum AccessStatus {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export type AccessType = {
  info?: Maybe<Array<Scalars['String']['output']>>;
  pack: Scalars['Packages']['output'];
  path: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type AuthOptions = {
  authParamKeyName?: Maybe<Scalars['String']['output']>;
  enabled: Scalars['Boolean']['output'];
  permission?: Maybe<PermissionType>;
  tokens: Array<TokenType>;
};

export type CaptchaOptions = {
  enabled: Scalars['Boolean']['output'];
  pack: Scalars['Packages']['output'];
  type: Scalars['String']['output'];
};

export type ConfigBase = {
  __typename?: 'ConfigBase';
  _id?: Maybe<Scalars['ObjectId']['output']>;
  created_by: Scalars['ObjectId']['output'];
  data?: Maybe<Scalars['Object']['output']>;
  title: Scalars['String']['output'];
  updated_by: Scalars['ObjectId']['output'];
};

export type ConfigDocument = {
  __typename?: 'ConfigDocument';
  _id?: Maybe<Scalars['ObjectId']['output']>;
  created_by: Scalars['ObjectId']['output'];
  data?: Maybe<Scalars['Object']['output']>;
  log: LogOptionsDocument;
  pack: Scalars['Packages']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updated_by: Scalars['ObjectId']['output'];
};

export type ConfigDocumentBase = {
  __typename?: 'ConfigDocumentBase';
  log: LogOptionsDocument;
  pack: Scalars['Packages']['output'];
  type: Scalars['String']['output'];
};

export type ConfigInput = {
  __typename?: 'ConfigInput';
  _id?: Maybe<Scalars['ObjectId']['output']>;
  created_by: Scalars['ObjectId']['output'];
  data?: Maybe<Scalars['Object']['output']>;
  log?: Maybe<LogOptionsInput>;
  title: Scalars['String']['output'];
  updated_by: Scalars['ObjectId']['output'];
};

export type ConfigOutput = MongoTimeStamps & {
  __typename?: 'ConfigOutput';
  _id?: Maybe<Scalars['ObjectId']['output']>;
  createdAt: Scalars['DateTime']['output'];
  created_by: Scalars['ObjectId']['output'];
  data?: Maybe<Scalars['Object']['output']>;
  log: LogOptionsDocument;
  pack: Scalars['Packages']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updated_by: Scalars['ObjectId']['output'];
};

export type ConfigPagination = Pagination & {
  __typename?: 'ConfigPagination';
  list: Array<ConfigSearch>;
  total?: Maybe<Scalars['Int']['output']>;
};

export type ConfigSearch = MongoTimeStamps & SearchScore & {
  __typename?: 'ConfigSearch';
  _id?: Maybe<Scalars['ObjectId']['output']>;
  createdAt: Scalars['DateTime']['output'];
  created_by: Scalars['ObjectId']['output'];
  data?: Maybe<Scalars['Object']['output']>;
  log: LogOptionsDocument;
  pack: Scalars['Packages']['output'];
  score?: Maybe<Scalars['Float']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updated_by: Scalars['ObjectId']['output'];
};

export type CountryDocument = CountryInput & {
  __typename?: 'CountryDocument';
  alpha2: Scalars['String']['output'];
  alpha3: Scalars['String']['output'];
  area?: Maybe<Scalars['Int']['output']>;
  gdp?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  population?: Maybe<Scalars['Int']['output']>;
  priority?: Maybe<Scalars['Int']['output']>;
  timezones: Array<TimeZoneDocument>;
};

export type CountryInput = {
  alpha2: Scalars['String']['output'];
  alpha3: Scalars['String']['output'];
  area?: Maybe<Scalars['Int']['output']>;
  gdp?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  population?: Maybe<Scalars['Int']['output']>;
  priority?: Maybe<Scalars['Int']['output']>;
};

export type CountryPagination = Pagination & {
  __typename?: 'CountryPagination';
  list: Array<CountrySearch>;
  total?: Maybe<Scalars['Int']['output']>;
};

export type CountrySearch = SearchScore & {
  __typename?: 'CountrySearch';
  alpha2: Scalars['String']['output'];
  alpha3: Scalars['String']['output'];
  area?: Maybe<Scalars['Int']['output']>;
  gdp?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  population?: Maybe<Scalars['Int']['output']>;
  priority?: Maybe<Scalars['Int']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  timezones: Array<TimeZoneDocument>;
};

export type CountryUpdate = {
  alpha2?: InputMaybe<Scalars['String']['input']>;
  alpha3?: InputMaybe<Scalars['String']['input']>;
  area?: InputMaybe<Scalars['Int']['input']>;
  gdp?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  population?: InputMaybe<Scalars['Int']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
};

export type DefaultAccessOptions = {
  action: Scalars['String']['output'];
  pack: Scalars['Packages']['output'];
  resource: Scalars['String']['output'];
  resourceAction: Scalars['String']['output'];
  types?: Maybe<Array<AccessType>>;
};

export type Enabled = {
  enabled: Scalars['Boolean']['output'];
};

export enum ExpressMethod {
  All = 'all',
  Delete = 'delete',
  Get = 'get',
  Head = 'head',
  Options = 'options',
  Patch = 'patch',
  Post = 'post',
  Put = 'put',
  Use = 'use'
}

export type GraphqlAccess = {
  __typename?: 'GraphqlAccess';
  pack: Scalars['Packages']['output'];
  services: Array<Scalars['String']['output']>;
};

export enum GraphqlMethod {
  Mutation = 'Mutation',
  Query = 'Query',
  Subscription = 'Subscription'
}

export type JobActionDocument = JobActionInput & MongoId & MongoTimeStamps & {
  __typename?: 'JobActionDocument';
  _id: Scalars['ObjectId']['output'];
  createdAt: Scalars['DateTime']['output'];
  job_id?: Maybe<Scalars['ObjectId']['output']>;
  steps: Array<JobStepInput>;
  updatedAt: Scalars['DateTime']['output'];
};

export type JobActionInput = {
  job_id?: Maybe<Scalars['ObjectId']['output']>;
  steps: Array<JobStepInput>;
};

export type JobActionPagination = Pagination & {
  __typename?: 'JobActionPagination';
  list: Array<JobActionSearch>;
  total?: Maybe<Scalars['Int']['output']>;
};

export type JobActionSearch = JobActionInput & MongoId & MongoTimeStamps & SearchScore & {
  __typename?: 'JobActionSearch';
  _id: Scalars['ObjectId']['output'];
  createdAt: Scalars['DateTime']['output'];
  job_id?: Maybe<Scalars['ObjectId']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  steps: Array<JobStepInput>;
  updatedAt: Scalars['DateTime']['output'];
};

export type JobBase = {
  created_by: Scalars['ObjectId']['output'];
  cron?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Scalars['Object']['output']>;
  description: Scalars['String']['output'];
  params: Scalars['Object']['output'];
  parent_id?: Maybe<Scalars['ObjectId']['output']>;
  status: JobStatus;
  updated_by: Scalars['ObjectId']['output'];
};

export type JobDocument = JobBase & MongoId & MongoTimeStamps & {
  __typename?: 'JobDocument';
  _id: Scalars['ObjectId']['output'];
  createdAt: Scalars['DateTime']['output'];
  created_by: Scalars['ObjectId']['output'];
  cron?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Scalars['Object']['output']>;
  description: Scalars['String']['output'];
  error?: Maybe<Scalars['String']['output']>;
  log: LogOptionsDocument;
  pack: Scalars['Packages']['output'];
  params: Scalars['Object']['output'];
  parent_id?: Maybe<Scalars['ObjectId']['output']>;
  run_on_startup: Scalars['Boolean']['output'];
  status: JobStatus;
  time_zone: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updated_by: Scalars['ObjectId']['output'];
};

export type JobInput = {
  created_by: Scalars['ObjectId']['output'];
  cron?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Scalars['Object']['output']>;
  description: Scalars['String']['output'];
  log?: Maybe<LogOptionsInput>;
  params: Scalars['Object']['output'];
  parent_id?: Maybe<Scalars['ObjectId']['output']>;
  run_on_startup?: Maybe<Scalars['Boolean']['output']>;
  status: JobStatus;
  time_zone?: Maybe<Scalars['String']['output']>;
  updated_by: Scalars['ObjectId']['output'];
};

export type JobPagination = Pagination & {
  __typename?: 'JobPagination';
  list: Array<JobSearch>;
  total?: Maybe<Scalars['Int']['output']>;
};

export type JobSearch = JobBase & JobInput & MongoId & MongoTimeStamps & SearchScore & {
  __typename?: 'JobSearch';
  _id: Scalars['ObjectId']['output'];
  createdAt: Scalars['DateTime']['output'];
  created_by: Scalars['ObjectId']['output'];
  cron?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Scalars['Object']['output']>;
  description: Scalars['String']['output'];
  log?: Maybe<LogOptionsInput>;
  params: Scalars['Object']['output'];
  parent_id?: Maybe<Scalars['ObjectId']['output']>;
  run_on_startup?: Maybe<Scalars['Boolean']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  status: JobStatus;
  time_zone?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  updated_by: Scalars['ObjectId']['output'];
};

export enum JobStatus {
  Active = 'Active',
  Disabled = 'Disabled',
  Error = 'Error',
  Initilized = 'Initilized',
  Success = 'Success'
}

export type JobStepInput = {
  data: Scalars['Object']['output'];
  error?: Maybe<Scalars['String']['output']>;
  identifier: Scalars['String']['output'];
  status: JobStepStatus;
};

export enum JobStepStatus {
  Error = 'Error',
  Executed = 'Executed',
  InQueue = 'InQueue',
  Initilized = 'Initilized'
}

export type LimitOptions = {
  enabled: Scalars['Boolean']['output'];
  limitInterval: Scalars['String']['output'];
  limitTreshold: Scalars['Int']['output'];
};

export type LogOptions = {
  enabled: Scalars['Boolean']['output'];
};

export type LogOptionsDocument = {
  enabled: Scalars['Boolean']['output'];
  max: Scalars['Int']['output'];
};

export type LogOptionsInput = {
  enabled?: Maybe<Scalars['Boolean']['output']>;
  max?: Maybe<Scalars['Int']['output']>;
};

export type MongoId = {
  _id: Scalars['ObjectId']['output'];
};

export type MongoIdMeybe = {
  _id?: Maybe<Scalars['ObjectId']['output']>;
};

export enum MongoOperationType {
  Create = 'create',
  CreateIndexes = 'createIndexes',
  Delete = 'delete',
  Drop = 'drop',
  DropCollection = 'dropCollection',
  DropDatabase = 'dropDatabase',
  DropIndexes = 'dropIndexes',
  Insert = 'insert',
  Invalidate = 'invalidate',
  Modify = 'modify',
  RefineCollectionShardKey = 'refineCollectionShardKey',
  Rename = 'rename',
  Replace = 'replace',
  ReshardCollection = 'reshardCollection',
  ShardCollection = 'shardCollection',
  Update = 'update'
}

export type MongoStream = {
  __typename?: 'MongoStream';
  documentKey: MongoId;
  fullDocument?: Maybe<Scalars['Object']['output']>;
  fullDocumentBeforeChange?: Maybe<Scalars['Object']['output']>;
  ns: MongoStreamNameSpace;
  operationType: MongoOperationType;
  updateDescription?: Maybe<MongoStreamUpdateDescription>;
};

export type MongoStreamInput = {
  operations: Array<MongoOperationType>;
};

export type MongoStreamNameSpace = {
  __typename?: 'MongoStreamNameSpace';
  coll?: Maybe<Scalars['String']['output']>;
  db?: Maybe<Scalars['String']['output']>;
};

export type MongoStreamUpdateDescription = {
  __typename?: 'MongoStreamUpdateDescription';
  removedFields: Array<Scalars['String']['output']>;
  truncatedArrays: Array<Scalars['String']['output']>;
  updatedFields: Scalars['Object']['output'];
};

export type MongoTimeStamps = {
  createdAt: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type MongoTimeStampsMeybe = {
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type MongoTimeStampsType = MongoTimeStamps & {
  __typename?: 'MongoTimeStampsType';
  createdAt: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type MongoUpdateRes = {
  __typename?: 'MongoUpdateRes';
  acknowledged?: Maybe<Scalars['Boolean']['output']>;
  matchedCount?: Maybe<Scalars['Int']['output']>;
  modifiedCount?: Maybe<Scalars['Int']['output']>;
  upsertedCount?: Maybe<Scalars['Int']['output']>;
  upsertedId?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  getPing?: Maybe<Scalars['Boolean']['output']>;
};

export type MySqlRes = {
  __typename?: 'MySqlRes';
  affectedRows?: Maybe<Scalars['Int']['output']>;
  changedRows?: Maybe<Scalars['Int']['output']>;
  fieldCount?: Maybe<Scalars['Int']['output']>;
  insertId?: Maybe<Scalars['Int']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  protocol41?: Maybe<Scalars['Boolean']['output']>;
  serverStatus?: Maybe<Scalars['Int']['output']>;
  warningCount?: Maybe<Scalars['Int']['output']>;
};

export type Pagination = {
  total?: Maybe<Scalars['Int']['output']>;
};

export enum PermissionType {
  Delete = 'Delete',
  Read = 'Read',
  Update = 'Update',
  Write = 'Write'
}

export type Query = {
  __typename?: 'Query';
  getConfig?: Maybe<ConfigOutput>;
  getCountry?: Maybe<CountryDocument>;
  getCurrentUser?: Maybe<UserOutput>;
  getJob?: Maybe<JobDocument>;
  getPing?: Maybe<Scalars['Boolean']['output']>;
  getUser?: Maybe<UserOutput>;
  searchConfigs?: Maybe<ConfigPagination>;
  searchCountry: Array<CountrySearch>;
  searchJob?: Maybe<JobPagination>;
  searchTimezone: Array<TimeZoneSearch>;
};


export type QueryGetConfigArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetCountryArgs = {
  alpha2: Scalars['String']['input'];
};


export type QueryGetJobArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetUserArgs = {
  id: Scalars['String']['input'];
};


export type QuerySearchConfigsArgs = {
  search: SearchInput;
};


export type QuerySearchCountryArgs = {
  list?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<SearchInput>;
};


export type QuerySearchJobArgs = {
  search?: InputMaybe<SearchInput>;
};


export type QuerySearchTimezoneArgs = {
  search?: InputMaybe<SearchInput>;
};

export type RoleConfigDataDocument = {
  __typename?: 'RoleConfigDataDocument';
  graphql_access: Array<GraphqlAccess>;
  name: Scalars['String']['output'];
  resource_access: Array<AccessDocument>;
};

export type RoleConfigDataInput = {
  __typename?: 'RoleConfigDataInput';
  graphql_access: Array<GraphqlAccess>;
  name: Scalars['String']['output'];
  resource_access: Array<AccessInput>;
};

export type RoleConfigDocument = {
  __typename?: 'RoleConfigDocument';
  _id?: Maybe<Scalars['ObjectId']['output']>;
  created_by: Scalars['ObjectId']['output'];
  data: RoleConfigDataDocument;
  log: LogOptionsDocument;
  pack: Scalars['Packages']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updated_by: Scalars['ObjectId']['output'];
};

export type RoleConfigInput = {
  __typename?: 'RoleConfigInput';
  _id?: Maybe<Scalars['ObjectId']['output']>;
  created_by: Scalars['ObjectId']['output'];
  data: RoleConfigDataInput;
  log?: Maybe<LogOptionsInput>;
  title: Scalars['String']['output'];
  updated_by: Scalars['ObjectId']['output'];
};

export type SearchInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  text: Scalars['String']['input'];
};

export type SearchScore = {
  score?: Maybe<Scalars['Float']['output']>;
};

export type ServerAccess = {
  path: Array<Scalars['String']['output']>;
  serverMethod: ServerMethod;
  serverType: ServerType;
};

export enum ServerMethod {
  Mutation = 'Mutation',
  Query = 'Query',
  Subscription = 'Subscription',
  All = 'all',
  Delete = 'delete',
  Get = 'get',
  Head = 'head',
  Options = 'options',
  Patch = 'patch',
  Post = 'post',
  Put = 'put',
  Use = 'use'
}

export enum ServerType {
  Express = 'EXPRESS',
  Graphql = 'GRAPHQL'
}

export type Subscription = {
  __typename?: 'Subscription';
  getPing?: Maybe<Scalars['Boolean']['output']>;
  streamConfig?: Maybe<MongoStream>;
  streamJob?: Maybe<MongoStream>;
  streamJobAction?: Maybe<MongoStream>;
};


export type SubscriptionStreamConfigArgs = {
  stream: MongoStreamInput;
};


export type SubscriptionStreamJobArgs = {
  stream: MongoStreamInput;
};


export type SubscriptionStreamJobActionArgs = {
  stream: MongoStreamInput;
};

export type TimeZoneDocument = TimeZoneInput & {
  __typename?: 'TimeZoneDocument';
  alpha2?: Maybe<Scalars['String']['output']>;
  dst: Scalars['String']['output'];
  name: Scalars['String']['output'];
  std: Scalars['String']['output'];
};

export type TimeZoneInput = {
  alpha2?: Maybe<Scalars['String']['output']>;
  dst: Scalars['String']['output'];
  name: Scalars['String']['output'];
  std: Scalars['String']['output'];
};

export type TimeZonePagination = Pagination & {
  __typename?: 'TimeZonePagination';
  list: Array<TimeZoneSearch>;
  total?: Maybe<Scalars['Int']['output']>;
};

export type TimeZoneSearch = SearchScore & {
  __typename?: 'TimeZoneSearch';
  alpha2?: Maybe<Scalars['String']['output']>;
  dst: Scalars['String']['output'];
  name: Scalars['String']['output'];
  score?: Maybe<Scalars['Float']['output']>;
  std: Scalars['String']['output'];
};

export enum TokenType {
  ApiKey = 'ApiKey',
  Basic = 'Basic',
  Bearer = 'Bearer',
  Cookie = 'Cookie'
}

export type TypeOptions = {
  mongoose?: Maybe<Scalars['String']['output']>;
};

export type UserDocument = MongoId & MongoTimeStamps & {
  __typename?: 'UserDocument';
  _id: Scalars['ObjectId']['output'];
  createdAt: Scalars['DateTime']['output'];
  psw: Scalars['String']['output'];
  roles: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  usn: Scalars['String']['output'];
};

export type UserInput = {
  _id?: Maybe<Scalars['ObjectId']['output']>;
  psw: Scalars['String']['output'];
  roles: Array<Scalars['String']['output']>;
  usn: Scalars['String']['output'];
};

export type UserOutput = MongoId & MongoTimeStamps & {
  __typename?: 'UserOutput';
  _id: Scalars['ObjectId']['output'];
  createdAt: Scalars['DateTime']['output'];
  roles?: Maybe<Array<RoleConfigDocument>>;
  updatedAt: Scalars['DateTime']['output'];
  usn: Scalars['String']['output'];
};

export type GetAdminUserDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAdminUserDataQuery = { __typename?: 'Query', getCurrentUser?: { __typename?: 'UserOutput', _id: any, usn: string, roles?: Array<{ __typename?: 'RoleConfigDocument', _id?: any | null, title: string, pack: any, type: string, data: { __typename?: 'RoleConfigDataDocument', name: string, resource_access: Array<{ __typename?: 'AccessDocument', status: AccessStatus, pack: any, resource: string, action?: string | null, permissions: Array<PermissionType> }>, graphql_access: Array<{ __typename?: 'GraphqlAccess', pack: any, services: Array<string> }> } }> | null } | null };


export const GetAdminUserDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAdminUserData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getCurrentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"usn"}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"pack"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"resource_access"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pack"}},{"kind":"Field","name":{"kind":"Name","value":"resource"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}},{"kind":"Field","name":{"kind":"Name","value":"graphql_access"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pack"}},{"kind":"Field","name":{"kind":"Name","value":"services"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetAdminUserDataQuery, GetAdminUserDataQueryVariables>;