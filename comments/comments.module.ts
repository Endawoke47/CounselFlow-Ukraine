import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Comment } from './entities/comment.entity';
import { CommentsService } from './services/comments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), UsersModule],
  controllers: [],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
