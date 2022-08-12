import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('follow')
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  following: Relation<User>;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  follower: Relation<User>;
}
