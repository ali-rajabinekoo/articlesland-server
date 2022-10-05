import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user/user.entity';
import { Article } from '../article/article.entity';

@Entity('notification')
export class Notification {
  @ApiProperty({ type: Number, default: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String })
  @Column({ nullable: false })
  type: string;

  // when type of notification is comment this field needed
  @ApiProperty({ type: String })
  @Column({ default: null, nullable: true })
  content?: string | null;

  @ApiProperty({ type: String, default: new Date() })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ type: Article, required: false })
  @ManyToOne(() => Article, (article) => article.id)
  article?: Relation<Article>;

  @ApiProperty({ type: User })
  @ManyToOne(() => User, (user) => user.id)
  creator: Relation<User>;

  @ApiProperty({ type: User })
  @ManyToOne(() => User, (user) => user.id)
  owner: Relation<User>;
}
