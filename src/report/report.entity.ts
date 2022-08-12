import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Article } from '../article/article.entity';
import { Comment } from '../comment/comment.entity';

@Entity('report')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  owner: Relation<User>;

  @ManyToOne(() => Article, (article) => article.id)
  @JoinColumn()
  article: Relation<Article>;

  @ManyToOne(() => Comment, (comment) => comment.id)
  @JoinColumn()
  comment: Relation<Comment>;
}
