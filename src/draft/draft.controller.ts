import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DraftService } from './draft.service';
import { ArticleDto } from '../article/article.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestFormat } from '../user/user.dto';
import { DraftDto } from './draft.dto';

@Controller('draft')
@ApiTags('draft')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DraftController {
  constructor(private readonly draftService: DraftService) {}

  @Post('/save')
  async saveDraft(@Body() fields: ArticleDto, @Req() req: RequestFormat) {
    const draft: DraftDto = new DraftDto();
    draft.userId = req.user.id;
    draft.body = fields.body;
    draft.title = fields.title;
    return this.draftService.saveDraft(draft);
  }

  @Get()
  async getHelloAsync(@Req() req: RequestFormat) {
    return this.draftService.getUserDrafts(req.user.id);
  }

  @Delete('/remove/:id')
  async removeDraft(@Param('id') id: string, @Req() req: RequestFormat) {
    return this.draftService.removeDraft(req.user.id, id);
  }

  @Get('/greeting')
  async getHello() {
    return this.draftService.getHello();
  }
}
