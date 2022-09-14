import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { DraftDto } from './draft.dto';

@Injectable()
export class DraftService {
  constructor(@Inject('MATH_SERVICE') private client: ClientProxy) {}

  async saveDraft(draft: DraftDto) {
    return this.client.emit('newDraft', draft);
  }

  async getUserDrafts(userId: number) {
    return this.client.send({ cmd: 'getDrafts' }, userId);
  }

  async removeDraft(userId: number, id: string) {
    return this.client.send({ cmd: 'removeDraft' }, { userId, id });
  }

  async getHello() {
    return this.client.send({ cmd: 'greeting' }, 'Progressive Coder');
  }
}
