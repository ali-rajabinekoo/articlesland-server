import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Relation,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { Follow } from 'src/follow/follow.entity';
import { Report } from 'src/report/report.entity';
import { Like } from 'src/like/like.entity';
import { Bookmark } from 'src/bookmark/bookmark.entity';
import { Article } from 'src/article/article.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ unique: true })
  phonenumber: string;

  @Column({ unique: true })
  email: string;

  @Column()
  avatar: string;

  @Column()
  bio: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Article, (article) => article.owner, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  articles: Relation<Article[]>;

  @OneToMany(() => Follow, (follow) => follow.follower, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  followers: Relation<Follow[]>;

  @OneToMany(() => Follow, (follow) => follow.following, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  following: Relation<Follow[]>;

  @OneToMany(() => Report, (report) => report.owner, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  reports: Relation<Report[]>;

  @OneToMany(() => Like, (like) => like.owner, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  likes: Relation<Like[]>;

  @OneToMany(() => Bookmark, (bookmark) => bookmark.owner, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  bookmarks: Relation<Bookmark[]>;

  @BeforeInsert() async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
