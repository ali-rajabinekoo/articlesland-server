import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Relation,
  OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Article } from '../article/article.entity';
import { Report } from '../report/report.entity';

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  body: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  owner: Relation<User>;

  @ManyToOne(() => Comment, (comment) => comment.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  parrent: Relation<Comment>;

  @ManyToOne(() => Article, (article) => article.id)
  @JoinColumn()
  article: Relation<Article>;

  @OneToMany(() => Report, (report) => report.comment, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  reports: Relation<Report[]>;
}
