import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray } from 'class-validator';
import { validationMessages } from '../libs/messages';

export class SelectedCategoriesDto {
  @ApiProperty({
    default: ['1', '2', '3'],
    description: 'Pass categories id to set them for user',
  })
  @IsArray()
  @ArrayMinSize(1, { message: validationMessages.length.selectedCategories })
  list: number[];
}
