import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    description: 'URL of the uploaded file',
    example: '/uploads/projects/1234567890-image.jpg',
  })
  url!: string;
}
