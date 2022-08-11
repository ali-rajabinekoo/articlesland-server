import { Article } from 'src/article/article.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';

@Entity('like')
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  owner: Relation<User>;

  @ManyToOne(() => Article, (article) => article.id)
  @JoinColumn()
  article: Relation<Article>;
}
