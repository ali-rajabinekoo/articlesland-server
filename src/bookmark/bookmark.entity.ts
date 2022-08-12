import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Article } from '../article/article.entity';

@Entity('bookmark')
export class Bookmark {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  owner: Relation<User>;

  @ManyToOne(() => Article, (article) => article.id)
  @JoinColumn()
  article: Relation<Article>;
}
