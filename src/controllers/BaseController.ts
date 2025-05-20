import { Repository, SelectQueryBuilder, FindOptionsOrderValue } from 'typeorm';
import { ListQueryParams, ListResponse, FilterOperator } from '../types/filter.types';

export class BaseController {
  protected buildListQuery<T>(
    queryBuilder: SelectQueryBuilder<T>,
    params: ListQueryParams
  ): SelectQueryBuilder<T> {
    const { filters, order } = params;

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        const columnName = key === 'createdAt' ? '"createdAt"' :
                          key === 'updatedAt' ? '"updatedAt"' :
                          key;

        if (typeof value === 'object' && value !== null) {
          const filterOp = value as FilterOperator;
          
          if (filterOp.eq !== undefined) {
            queryBuilder.andWhere(`${columnName} = :${key}Eq`, { [`${key}Eq`]: filterOp.eq });
          }
          if (filterOp.neq !== undefined) {
            queryBuilder.andWhere(`${columnName} != :${key}Neq`, { [`${key}Neq`]: filterOp.neq });
          }
          if (filterOp.gt !== undefined) {
            queryBuilder.andWhere(`${columnName} > :${key}Gt`, { [`${key}Gt`]: filterOp.gt });
          }
          if (filterOp.gte !== undefined) {
            queryBuilder.andWhere(`${columnName} >= :${key}Gte`, { [`${key}Gte`]: filterOp.gte });
          }
          if (filterOp.lt !== undefined) {
            queryBuilder.andWhere(`${columnName} < :${key}Lt`, { [`${key}Lt`]: filterOp.lt });
          }
          if (filterOp.lte !== undefined) {
            queryBuilder.andWhere(`${columnName} <= :${key}Lte`, { [`${key}Lte`]: filterOp.lte });
          }
          if (filterOp.like !== undefined) {
            queryBuilder.andWhere(`LOWER(${columnName}) LIKE LOWER(:${key}Like)`, {
              [`${key}Like`]: `%${filterOp.like}%`
            });
          }
          if (filterOp.in !== undefined) {
            queryBuilder.andWhere(`${columnName} IN (:...${key}In)`, { [`${key}In`]: filterOp.in });
          }
        } else {
          queryBuilder.andWhere(`${columnName} = :${key}`, { [key]: value });
        }
      });
    }

    if (order) {
      Object.entries(order).forEach(([key, value]: [string, FindOptionsOrderValue]) => {
        // Ensure proper column name casing for special fields
        const columnName = key === 'createdAt' ? '"createdAt"' : 
                          key === 'updatedAt' ? '"updatedAt"' : 
                          key;
        queryBuilder.addOrderBy(columnName, value as 'ASC' | 'DESC');
      });
    }

    return queryBuilder;
  }

  protected async executeListQuery<T>(
    queryBuilder: SelectQueryBuilder<T>,
    params: ListQueryParams
  ): Promise<ListResponse<T>> {
    const limit = params.limit || 10;
    const offset = params.offset || 0;

    const [items, total] = await queryBuilder
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return {
      items,
      total,
      limit,
      offset
    };
  }
}