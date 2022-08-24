import { nodemailerConfig } from './config';
import Mail from 'nodemailer/lib/mailer';

export class MellipayamakResponse {
  Value: string;

  RetStatus: number;

  StrRetStatus: string;
}

export class NodemailerOptionsDto implements Mail.Options {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;

  constructor() {
    this.from = nodemailerConfig.from;
    this.subject = nodemailerConfig.subject;
  }
}
