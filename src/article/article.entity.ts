import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Relation,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Category } from '../category/category.entity';
import { Report } from '../report/report.entity';
import { Like } from '../like/like.entity';
import { Bookmark } from '../bookmark/bookmark.entity';
import { Comment } from '../comment/comment.entity';

@Entity('article')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column({ unique: true })
  email: string;

  @Column()
  bodyUrl: string;

  @Column()
  bannerUrl: string;

  @Column({ default: false })
  published: boolean;

  @Column({ default: 0 })
  viewed: number;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  owner: Relation<User>;

  @ManyToOne(() => Category, (user) => user.id)
  @JoinColumn()
  category: Relation<Category>;

  @OneToMany(() => Report, (report) => report.article, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  reports: Relation<Report[]>;

  @OneToMany(() => Like, (like) => like.article, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  likes: Relation<Like[]>;

  @OneToMany(() => Bookmark, (bookmark) => bookmark.article, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  bookmarks: Relation<Bookmark[]>;

  @OneToMany(() => Comment, (comment) => comment.article, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  articles: Relation<Article[]>;
}
