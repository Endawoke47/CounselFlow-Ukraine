import {
  Body,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Type,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { ICrudService } from './crud-service.interface';

/**
 * Creates a base CRUD controller with standard operations
 * @param entityType The entity type
 * @param createDtoType The DTO type for create operations
 * @param updateDtoType The DTO type for update operations
 * @param mapEntityToResponse Optional mapper function to transform entities before sending responses
 * @param paginatedResponseType Optional type for paginated responses
 * @returns An abstract controller class that can be extended
 */
export function createCrudController<
  EntityType,
  CreateRequestType,
  UpdateRequestType,
  ResponseType,
  PaginatedResponseType,
>(
  entityType: Type<EntityType>,
  createDtoType: Type<CreateRequestType>,
  updateDtoType: Type<UpdateRequestType>,
  mapEntityToResponse?: (entity: EntityType) => ResponseType,
) {
  abstract class AbstractCrudController {
    constructor(
      public readonly service: ICrudService<
        EntityType,
        CreateRequestType,
        UpdateRequestType
      >,
    ) {}

    @Post()
    @ApiOperation({
      summary: 'Create a new entity',
    })
    @ApiResponse({
      status: 201,
      description: 'Entity has been successfully created.',
      type: entityType,
    })
    @ApiResponse({
      status: 400,
      description: 'Bad request - validation failed.',
    })
    async create(
      @Body(
        new ValidationPipe({
          expectedType: createDtoType,
          transform: true,
          forbidUnknownValues: true,
          transformOptions: {
            enableImplicitConversion: true,
            exposeDefaultValues: true,
            enableCircularCheck: true,
          },
        }),
      )
      createDto: CreateRequestType,
    ): Promise<ResponseType | EntityType> {
      const entity = await this.service.create(createDto);

      return mapEntityToResponse ? mapEntityToResponse(entity) : entity;
    }

    @Get()
    @ApiOperation({
      summary: 'Get all entities',
      description:
        'Retrieves a paginated list of all entities with sorting, filtering, and search capabilities. ' +
        'Example full requests(replace {entities} with the actual entity name):\n\n' +
        '- `/{entities}?page=1&limit=10&sortBy=name:ASC&search=example` - First page with 10 items, sorted by name, searching for "example"\n\n' +
        '- `/{entities}?page=2&limit=25&sortBy=createdAt:DESC&filter.status=active` - Second page with 25 items, sorted by creation date descending, filtering for active status\n\n' +
        '- `/{entities}?page=1&limit=10&filter.price=$gt:100&filter.category=premium&sortBy=price:DESC` - First page, filtering for price>100 AND category=premium, sorted by price descending\n\n' +
        '- `/{entities}?page=1&limit=10&filter.createdAt=$btw:2023-01-01,2023-12-31&search=important` - First page, filtering for items created in 2023, containing "important"\n\n' +
        '- `/{entities}?page=1&limit=10&select=id,name,status` - First page, returning only ID, name and status fields for each entity\n\n' +
        '- `/{entities}?select=id,name&filter.status=active&sortBy=name:ASC` - Return only ID and name fields of active entities, sorted by name\n\n' +
        '- `/{entities}?search=test&searchBy=name,description` - Search for "test" but only in name and description fields',
    })
    @ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (starts from 1)',
      example: 1,
    })
    @ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page',
      example: 10,
    })
    @ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description:
        'Sort configuration (comma-separated for multiple fields). Format: field:direction',
      examples: {
        singleSort: {
          value: 'name:ASC',
          description: 'Sort by name in ascending order',
        },
        multipleSort: {
          value: 'name:ASC,createdAt:DESC',
          description:
            'Sort by name (ascending) then by creation date (descending)',
        },
        defaultSort: {
          value: 'id:DESC',
          description: 'Sort by ID in descending order',
        },
      },
    })
    @ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description:
        'Search term to filter by searchable columns (usually text fields). This performs a partial match search across all searchable columns.',
      examples: {
        simple: {
          value: 'example',
          description: 'Search for "example" in all searchable columns',
        },
        multipleWords: {
          value: 'test project',
          description: 'Search for "test project" in all searchable columns',
        },
      },
    })
    @ApiQuery({
      name: 'filter.[field]',
      required: false,
      type: String,
      description:
        'Filter by specific field. Supports multiple operators for advanced filtering.',
      examples: {
        equal: {
          value: 'filter.status=active',
          description: 'Filter where status equals "active"',
        },
        filterId: {
          value: 'filter.id=1,2,3',
          description: 'Filter by IDs (comma-separated)',
        },
        in: {
          value: 'filter.category=category1,category2',
          description:
            'Filter where category is either "category1" or "category2"',
        },
        range: {
          value: 'filter.price=$gt:10,$lt:100',
          description:
            'Filter where price is greater than 10 and less than 100',
        },
        boolean: {
          value: 'filter.isActive=true',
          description: 'Filter where isActive is true',
        },
        equalOperator: {
          value: 'filter.name=$eq:Test',
          description:
            'Filter using $eq operator (equivalent to filter.name=Test)',
        },
        notEqual: {
          value: 'filter.status=$not:inactive',
          description: 'Filter where status is NOT "inactive"',
        },
        greaterThan: {
          value: 'filter.price=$gt:100',
          description: 'Filter where price is greater than 100',
        },
        lessThan: {
          value: 'filter.price=$lt:50',
          description: 'Filter where price is less than 50',
        },
        greaterOrEqual: {
          value: 'filter.amount=$gte:1000',
          description: 'Filter where amount is greater than or equal to 1000',
        },
        lessOrEqual: {
          value: 'filter.amount=$lte:500',
          description: 'Filter where amount is less than or equal to 500',
        },
        between: {
          value: 'filter.price=$btw:10,100',
          description: 'Filter where price is between 10 and 100',
        },
        like: {
          value: 'filter.name=$ilike:test',
          description: 'Filter where name contains "test" (case insensitive)',
        },
        startsWith: {
          value: 'filter.name=$sw:test',
          description: 'Filter where name starts with "test"',
        },
        isNull: {
          value: 'filter.deletedAt=$null',
          description: 'Filter where deletedAt is NULL',
        },
        isNotNull: {
          value: 'filter.updatedAt=$not:$null',
          description: 'Filter where updatedAt is NOT NULL',
        },
        dateRange: {
          value: 'filter.createdAt=$btw:2023-01-01,2023-12-31',
          description:
            'Filter where createdAt is between 2023-01-01 and 2023-12-31',
        },
        dateComparison: {
          value: 'filter.createdAt=$lt:2023-12-31T23:59:59.999Z',
          description: 'Filter where createdAt is before December 31, 2023',
        },
      },
    })
    @ApiQuery({
      name: 'searchBy',
      required: false,
      type: String,
      description:
        'Limit the search to specific fields (comma-separated). Only works when used with the search parameter.',
      examples: {
        singleField: {
          value: 'name',
          description: 'Search only in the name field',
        },
        multipleFields: {
          value: 'name,description',
          description: 'Search in both name and description fields',
        },
      },
    })
    @ApiQuery({
      name: 'select',
      required: false,
      type: String,
      description:
        'Select specific fields to include in the response (comma-separated). Note: the ID field must always be included in the selection.',
      examples: {
        idAndName: {
          value: 'id,name',
          description: 'Return only ID and name fields',
        },
        basicInfo: {
          value: 'id,name,description',
          description: 'Return basic entity information',
        },
        withDates: {
          value: 'id,name,createdAt,updatedAt',
          description: 'Return entity with creation and update timestamps',
        },
        fullSelection: {
          value: '*',
          description: 'Return all available fields',
        },
      },
    })
    @ApiOkResponse({
      description:
        'Returns paginated entities with metadata and navigation links.',
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(entityType) },
              },
              meta: {
                type: 'object',
                properties: {
                  totalItems: { type: 'number' },
                  itemCount: { type: 'number' },
                  itemsPerPage: { type: 'number' },
                  totalPages: { type: 'number' },
                  currentPage: { type: 'number' },
                  sortBy: { type: 'string' },
                  searchBy: { type: 'string' },
                  search: { type: 'string' },
                  select: { type: 'string' },
                  filter: { type: 'object' },
                },
              },
              links: {
                type: 'object',
                properties: {
                  first: { type: 'string' },
                  previous: { type: 'string' },
                  current: { type: 'string' },
                  next: { type: 'string' },
                  last: { type: 'string' },
                },
              },
            },
          },
        ],
      },
    })
    async find(
      @Paginate() query: PaginateQuery,
    ): Promise<PaginatedResponseType> {
      const paginatedResult = await this.service.find(query);

      // If we have a mapper function, apply it to each item in the data array
      if (mapEntityToResponse && paginatedResult.data) {
        return {
          ...paginatedResult,
          data: paginatedResult.data.map(item => mapEntityToResponse(item)),
        } as PaginatedResponseType;
      }

      return paginatedResult as PaginatedResponseType;
    }

    @Get(':id')
    @ApiOperation({
      summary: 'Get entity by id',
    })
    @ApiParam({ name: 'id', description: 'ID', example: 1 })
    @ApiResponse({
      status: 200,
      description: 'Returns the entity.',
      type: entityType,
    })
    @ApiResponse({
      status: 404,
      description: 'Entity not found.',
    })
    async findOne(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<ResponseType | EntityType> {
      const entity = await this.service.findOne(id);

      return mapEntityToResponse ? mapEntityToResponse(entity) : entity;
    }

    @Patch(':id')
    @ApiOperation({
      summary: 'Update entity',
    })
    @ApiParam({ name: 'id', description: 'ID', example: 1 })
    @ApiResponse({
      status: 200,
      description: 'The entity has been successfully updated.',
      type: entityType,
    })
    @ApiResponse({
      status: 404,
      description: 'Entity not found.',
    })
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body(
        new ValidationPipe({
          expectedType: updateDtoType,
          transform: true,
          forbidUnknownValues: true,
          transformOptions: {
            enableImplicitConversion: true,
            exposeDefaultValues: true,
            enableCircularCheck: true,
          },
        }),
      )
      updateDto: UpdateRequestType,
    ): Promise<ResponseType | EntityType> {
      const entity = await this.service.update(id, updateDto);
      return mapEntityToResponse ? mapEntityToResponse(entity) : entity;
    }

    @Delete(':id')
    @ApiOperation({
      summary: 'Delete entity (soft delete)',
    })
    @ApiParam({ name: 'id', description: 'ID', example: 1 })
    @ApiResponse({
      status: 204,
      description: 'The entity has been successfully deleted.',
    })
    @ApiResponse({
      status: 404,
      description: 'Entity not found.',
    })
    @HttpCode(204)
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
      await this.service.delete(id);
    }

    @Post(':id/restore')
    @ApiOperation({
      summary: 'Restore a soft-deleted entity',
    })
    @ApiParam({ name: 'id', description: 'ID', example: 1 })
    @ApiResponse({
      status: 200,
      description: 'The entity has been successfully restored.',
    })
    @ApiResponse({
      status: 404,
      description: 'Entity not found or not deleted.',
    })
    async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
      await this.service.restore(id);
    }
  }

  return AbstractCrudController;
}
