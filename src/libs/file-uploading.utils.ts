import { exceptionMessages } from './messages';
import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

export const imageFileFilter = (req, file: Express.Multer.File, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return callback(
      new BadRequestException(exceptionMessages.invalid.imageFileFormat),
      false,
    );
  }
  callback(null, true);
};

export const avatarStorage = diskStorage({
  destination: './public/assets/avatars/',
});

export const bannerStorage = diskStorage({
  destination: './public/assets/banners/',
});

// size : 2MB
export const imageSize = 1000000 * 2;
