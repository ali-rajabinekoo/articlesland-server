import { Controller, Get } from '@nestjs/common';
import { DraftService } from './draft.service';

@Controller('draft')
export class DraftController {
  constructor(private readonly draftService: DraftService) {
  }

  @Get('/greeting')
  async getHello() {
    return this.draftService.getHello();
  }

  @Get('/greeting-async')
  async getHelloAsync() {
    return this.draftService.getHelloAsync();
  }

  @Get('/hello')
  async getHello2() {
    return 'hello';
  }
}
