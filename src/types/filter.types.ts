import { FindOptionsOrder } from 'typeorm';

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface FilterOperator {
  eq?: any;       // equals
  neq?: any;      // not equals
  gt?: any;       // greater than
  gte?: any;      // greater than or equals
  lt?: any;       // less than
  lte?: any;      // less than or equals
  like?: string;  // LIKE query (case-insensitive)
  in?: any[];     // IN query
}

export interface FilterParams {
  [key: string]: FilterOperator | any;
}

export interface ListQueryParams extends PaginationParams {
  filters?: FilterParams;
  order?: FindOptionsOrder<any>;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}