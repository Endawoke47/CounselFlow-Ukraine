import { Paginated, PaginateQuery } from 'nestjs-paginate';

export interface ICrudService<
  EntityType,
  CreateRequestType,
  UpdateRequestType,
> {
  create(createDto: CreateRequestType): Promise<EntityType>;
  find(
    query: PaginateQuery,
    withDeleted?: boolean,
  ): Promise<Paginated<EntityType>>;
  findOne(id: number, withDeleted?: boolean): Promise<EntityType>;
  update(id: number, updateDto: UpdateRequestType): Promise<EntityType>;
  delete(id: number): Promise<void>;
  restore(id: number): Promise<void>;
}
