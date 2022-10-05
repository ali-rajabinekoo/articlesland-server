import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Relation,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Article } from '../article/article.entity';
import { Report } from '../report/report.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../category/category.entity';
import { Comment } from '../comment/comment.entity';
import * as bcrypt from 'bcrypt';
import { Notification } from '../notification/notification.entity';

@Entity('user')
export class User {
  @ApiProperty({ type: Number, default: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String, default: 'articlesLandUser' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ type: String, default: 'ArticlesLand user' })
  @Column({ default: null })
  displayName: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({ type: String, default: '9212210982' })
  @Column({ unique: true })
  phoneNumber: string;

  @ApiProperty({ type: String, default: 'articlesLandUser@email.com' })
  @Column({ unique: true, default: null })
  email: string;

  @ApiProperty({ type: String, default: '/avatar/something.png' })
  @Column({ default: null })
  avatar: string;

  @ApiProperty({ type: String, default: 'This is ArticlesLand user' })
  @Column({ default: null })
  bio: string;

  @ApiProperty({ type: String, default: 'User refresh token' })
  @Column({ unique: true, default: null })
  refreshToken: string;

  @Column({ default: false })
  @Exclude({ toPlainOnly: true })
  activated: boolean;

  @ApiProperty({ type: String, default: new Date() })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ type: String, default: new Date() })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ type: [Article] })
  @OneToMany(() => Article, (article) => article.owner, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  articles: Relation<Article[]>;

  @ApiProperty({ type: [Notification] })
  @OneToMany(() => Notification, (notification) => notification.owner, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  notifications: Relation<Notification[]>;

  @ApiProperty({
    default: {
      id: 2,
      username: 'articlesLandUser2',
      phoneNumber: '9212210982',
      email: 'articlesLandUser2@email.com',
      avatar: '/avatar/something2.png',
      bio: 'This is ArticlesLand user 2',
      created_at: '2022-08-17T18:20:49.785Z',
      updated_at: '2022-08-17T18:20:49.785Z',
    },
    description: 'Some users that follow this user',
  })
  @ManyToMany(() => User)
  @JoinTable({ name: 'followers' })
  followers: Relation<User[]>;

  @ApiProperty({
    default: {
      id: 2,
      username: 'articlesLandUser2',
      phoneNumber: '9212210982',
      email: 'articlesLandUser2@email.com',
      avatar: '/avatar/something2.png',
      bio: 'This is ArticlesLand user 2',
      created_at: '2022-08-17T18:20:49.785Z',
      updated_at: '2022-08-17T18:20:49.785Z',
    },
    description: 'Some users that follow this user',
  })
  @ManyToMany(() => User)
  @JoinTable({ name: 'followings' })
  followings: Relation<User[]>;

  @ApiProperty({ type: [Report] })
  @OneToMany(() => Report, (report) => report.owner, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  reports: Relation<Report[]>;

  @ManyToMany(() => Article, (article) => article.id)
  @JoinTable({ name: 'likes' })
  likes: Relation<Article[]>;

  @ApiProperty({ type: [Article] })
  @ManyToMany(() => Article, (article) => article.id)
  @JoinTable({ name: 'bookmarks' })
  bookmarks: Relation<Article[]>;

  @ApiProperty({ type: [Category] })
  @ManyToMany(() => Category, (category) => category.id)
  @JoinTable({ name: 'user_categories' })
  selectedCategories: Relation<Category[]>;

  @ApiProperty({ type: [Comment] })
  @OneToMany(() => Comment, (comment) => comment.owner, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @Exclude({ toPlainOnly: true })
  comments: Relation<Comment[]>;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
