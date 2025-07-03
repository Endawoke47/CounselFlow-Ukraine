import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Text content of the comment',
    example:
      'Initial review of IP documentation shows significant gaps in chain of title for the core technology platform.',
  })
  @IsString()
  @IsNotEmpty()
  commentText!: string;
}
