import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { CreateCommentDto } from './create-comment.dto';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @ApiPropertyOptional({
    description:
      'ID of the comment to update. If not provided, a new comment will be created.',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  id?: number;
}
