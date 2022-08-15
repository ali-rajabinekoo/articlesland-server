import { CronJob } from 'cron';
import utils from './utils';

export const clearingKeyvScheduler = new CronJob(
  '00 00 00 * * *',
  async () => {
    try {
      await utils.clearKeyValueTable();
    } catch (e) {
      console.log('cronjobError: ', e);
    }
  },
  null,
  true,
  process.env.TZ,
);
