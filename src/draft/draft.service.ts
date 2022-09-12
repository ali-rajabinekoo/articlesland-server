import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class DraftService {
  constructor(@Inject('MATH_SERVICE') private client: ClientProxy){}

  async getHello(){
    return this.client.send({cmd: 'greeting'}, 'Progressive Coder');
  }

  async getHelloAsync() {
    return this.client.send({cmd: 'greeting-async'}, 'Progressive Coder');
  }
}
