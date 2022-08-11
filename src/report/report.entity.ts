import { Article } from 'src/article/article.entity';
import { Comment } from 'src/comment/comment.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';

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
