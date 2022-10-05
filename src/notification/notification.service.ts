import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { NewNotificationDto } from './notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async newNotification(data: NewNotificationDto): Promise<void> {
    const notification: Notification = this.notificationRepository.create(data);
    await this.notificationRepository.save(notification);
  }
}
