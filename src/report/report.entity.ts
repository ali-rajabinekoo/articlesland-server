import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Relation,
  Column,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Article } from '../article/article.entity';
import { Comment } from '../comment/comment.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('report')
export class Report {
  @ApiProperty({ type: Number, default: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String })
  @Column({ default: null, nullable: true })
  type?: string | null;

  @ApiProperty({ type: String })
  @Column({ default: null, nullable: true })
  content?: string | null;

  @ApiProperty({
    type: User,
    default: {
      id: 1,
      username: 'articlesLandUser',
      phoneNumber: '9212210982',
      email: 'articlesLandUser@email.com',
      avatar: '/avatar/something.png',
      bio: 'This is ArticlesLand user',
      created_at: new Date(),
      updated_at: new Date(),
    },
  })
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  owner: Relation<User>;

  @ManyToOne(() => Article, (article) => article.id)
  @JoinColumn()
  article?: Relation<Article> | null;

  @ManyToOne(() => Comment, (comment) => comment.id)
  @JoinColumn()
  comment?: Relation<Comment> | null;
}
