import { User } from '../user/user.entity';
import { Article } from '../article/article.entity';
import { ArticleResDto } from '../article/article.dto';
import { UserResDto } from '../user/user.dto';
import { Notification } from './notification.entity';

export class NewNotificationDto {
  type: 'like' | 'follow' | 'comment';
  content?: string;
  article?: Article;
  creator: User;
  owner: User;
}

// Response Serialization DTOs

export class NotificationResDto {
  owner?: UserResDto;
  creator?: UserResDto;
  article?: ArticleResDto;

  constructor(partial: Partial<Notification>) {
    if (partial?.owner) {
      this.owner = new UserResDto(partial.owner, { protectedUser: true });
    }
    if (partial?.creator) {
      this.creator = new UserResDto(partial.creator, { protectedUser: true });
    }
    if (partial?.article) {
      this.article = new ArticleResDto(partial.article);
    }
    Object.assign(this, partial);
  }
}
