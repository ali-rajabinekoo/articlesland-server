import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Relation,
} from 'typeorm';
import { Article } from '../article/article.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column()
  avatar: string;

  @OneToMany(() => Article, (article) => article.category, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  articles: Relation<Article[]>;
}
