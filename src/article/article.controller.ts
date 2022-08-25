import {
  ClassSerializerInterceptor,
  Controller,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UnauthorizedDto } from '../auth/auth.dto';
import { ArticleService } from './article.service';

@Controller('article')
@ApiBearerAuth()
@ApiTags('user')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({ description: 'Unauthorized', type: UnauthorizedDto })
export class ArticleController {
  constructor(private articleService: ArticleService) {}
  
  
}
