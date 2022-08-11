import { Article } from 'src/article/article.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Relation,
} from 'typeorm';

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
