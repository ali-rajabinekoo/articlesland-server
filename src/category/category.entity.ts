import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Relation,
} from 'typeorm';
import { Article } from '../article/article.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('category')
export class Category {
  @ApiProperty({ type: Number, default: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String, default: 'Politics' })
  @Column({ unique: true })
  title: string;

  @ApiProperty({ type: String, default: '/articleAvatar/articleAvatar1.png' })
  @Column()
  avatar: string;

  @ApiProperty({
    type: [Article],
    default: [
      {
        id: 1,
        title: 'Article title',
        bodyUrl: '/article/article1.html',
        bannerUrl: '/banner/article1.jpg',
        published: true,
        viewed: 8,
        role: 'user',
        created_at: '2022-08-18T07:02:47.480Z',
        updated_at: '2022-08-18T07:02:47.480Z',
      },
    ],
  })
  @OneToMany(() => Article, (article) => article.category, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  articles: Relation<Article[]>;
}
