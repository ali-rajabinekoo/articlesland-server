import { systemMessage } from './messages';

export const mellipayamak = {
  url: 'https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber',
  username: '09212210982',
  password: 'F!$5#',
  authBodyId: 95641,
};

export const database = {
  dbname: process.env.MYSQL_DATABASE || 'articlesland',
  dbnameTest: 'articleslandTest',
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_TCP_PORT) || 3306,
  username: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD || '1379rajabi',
  keyv:
    process.env.MYSQL_KEY_VALUE_DATABASE_URL ||
    'mysql://root:1379rajabi@localhost:3306/articlesland',
  keyvTest: 'mysql://root:1379rajabi@localhost:3306/articleslandTest',
};

export const rabbitmqUrl: string =
  process.env.AMQP_URL || 'amqp://localhost:5672';

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

// 12 article per page
export const getArticleLimit = 12;

// 30 article per page
export const getUsersLimit = 30;
