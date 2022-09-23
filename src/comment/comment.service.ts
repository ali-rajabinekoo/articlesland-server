import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { NewCommentDto } from './comment.dto';
import { User } from '../user/user.entity';
import { Article } from '../article/article.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async addNewComment(
    owner: User,
    article: Article,
    newComment: NewCommentDto,
    parentComment?: Comment | undefined | null,
  ): Promise<Comment> {
    const query: DeepPartial<Comment> = {
      body: newComment.body,
      article,
      owner,
    };
    if (!!parentComment) {
      query.parent = parentComment;
      parentComment.childNumber = parentComment.childNumber + 1;
      await this.commentRepository.save(parentComment);
    }
    const comment: Comment = await this.commentRepository.create(query);
    await this.commentRepository.save(comment);
    return comment;
  }

  async findCommentById(id: number): Promise<Comment> {
    return this.commentRepository.findOne({
      where: {
        id,
      },
      relations: ['article', 'parent', 'children', 'reports', 'owner'],
    });
  }

  async removeComment(comment: Comment): Promise<void> {
    await this.commentRepository.remove(comment);
  }

  async saveComment(comment: Comment): Promise<void> {
    await this.commentRepository.save(comment);
  }
}
