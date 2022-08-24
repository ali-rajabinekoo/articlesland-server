import { systemMessage } from './messages';

export const mellipayamak = {
  url: 'https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber',
  username: '09212210982',
  password: 'F!$5#',
  authBodyId: 95641,
};

export const database = {
  dbname: 'articlesland',
  dbnameTest: 'articleslandTest',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'test',
  keyv: 'mysql://root:test@localhost:3306/articlesland',
  keyvTest: 'mysql://root:test@localhost:3306/articleslandTest',
};

export const jwtConfig = {
  secret: '953ef985e05a7adcd0a3d5d4f141828059667aa7',
  expireAt: '5400s',
};

export const nodemailerConfig = {
  host: 'mail.articlesland.ir',
  port: 465,
  secure: true,
  username: 'admin@articlesland.ir',
  password: '1379ali9731',
  from: 'admin@articlesland.ir',
  subject: systemMessage.emailSubject,
};

// 2 minutes
export const codeExpire = 120000;

// 2 minutes
export const emailCodeExpire = 120000;
