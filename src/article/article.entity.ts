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
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Category } from '../category/category.entity';
import { Report } from '../report/report.entity';
import { Comment } from '../comment/comment.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity('article')
export class Article {
  @ApiProperty({ type: Number, default: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String, default: 'Article title' })
  @Column({ unique: true })
  title: string;

  @ApiProperty({
    type: String,
    default:
      'Article title description. this field some first lines of article body',
  })
  @Column()
  description: string;

  @ApiProperty({ type: String, default: '/article/article1.html' })
  @Exclude({ toPlainOnly: true })
  @Column()
  bodyUrl: string;

  @ApiProperty({ type: String, default: '/banner/article1.jpg' })
  @Column({ default: null })
  bannerUrl: string;

  @ApiProperty({ type: Boolean, default: true })
  @Column({ default: false })
  published: boolean;

  @ApiProperty({ type: Number, default: 8 })
  @Column({ default: 0 })
  viewed: number;

  @ApiProperty({ type: String, default: new Date() })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ type: String, default: new Date() })
  @UpdateDateColumn()
  updated_at: Date;

  @Column({ default: 0, type: Number })
  likesNumber?: number;

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

  @ApiProperty({ type: [Category] })
  @ManyToOne(() => Category, (user) => user.id)
  @JoinColumn()
  category: Relation<Category>;

  @OneToMany(() => Report, (report) => report.article, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  reports: Relation<Report[]>;

  @ManyToMany(() => User, (user) => user.id)
  @JoinTable({ name: 'likes' })
  likes: Relation<User[]>;

  @ApiProperty({ type: [Comment] })
  @OneToMany(() => Comment, (comment) => comment.article, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  comments: Relation<Comment[]>;
}
