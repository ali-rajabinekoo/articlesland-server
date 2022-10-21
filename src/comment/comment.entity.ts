import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Relation,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Article } from '../article/article.entity';
import { Report } from '../report/report.entity';
import { ApiProperty } from '@nestjs/swagger';
import { commentSchemaApiDocument } from './comment.dto';

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: Number, default: 1 })
  id: number;

  @Column('varchar', { length: 500 })
  @ApiProperty({ type: String, default: 'خیلی عالی بود' })
  body: string;

  @Column({ default: 0 })
  @ApiProperty({ type: Number, default: 0 })
  childNumber: number;

  @CreateDateColumn()
  @ApiProperty({ type: String, default: new Date() })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable()
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
  owner: Relation<User>;

  @ManyToOne(() => Comment, (comment) => comment.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  @ApiProperty({
    type: Comment,
    default: commentSchemaApiDocument,
  })
  parent: Relation<Comment>;

  @OneToMany(() => Comment, (comment) => comment.parent, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    // eager: true,
  })
  @ApiProperty({
    type: [Comment],
    default: [commentSchemaApiDocument],
  })
  children: Relation<Comment[]>;

  @ManyToOne(() => Article, (article) => article.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  @ApiProperty({ type: Article })
  article: Relation<Article>;

  @OneToMany(() => Report, (report) => report.comment, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @ApiProperty({ type: [Report] })
  reports: Relation<Report[]>;
}
