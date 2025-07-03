import { Injectable } from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { Comment } from '../entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
  ) {}

  /**
   * Creates a new comment
   *
   * @param transactionManager - The transaction manager to use
   * @param createCommentDto - The comment data
   * @param createdBy - The user creating the comment
   *
   * @returns The created comment
   */
  async create(
    createCommentDto: CreateCommentDto,
    createdBy: User,
    queryRunner?: QueryRunner,
  ): Promise<Comment> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Comment)
      : this.commentsRepo;

    const comment = repository.create({
      commentText: createCommentDto.commentText,
      createdBy,
    });

    return repository.save(comment);
  }
}
