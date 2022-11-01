import { CronJob } from 'cron';
import utils from './utils';

export const clearingKeyValueDatabaseScheduler = new CronJob(
  '00 00 00 * * *',
  async () => {
    try {
      await utils.verification.clearKeyValueTable();
      await utils.views.clearKeyValueTable();
    } catch (e) {
      console.log('cronjobError: ', e);
    }
  },
  null,
  true,
  process.env.TZ,
);
