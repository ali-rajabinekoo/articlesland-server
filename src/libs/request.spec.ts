import request from './request';
import { MellipayamakResponse } from './schemas';

describe('Request service', () => {
  it('should be defined', () => {
    expect(request).toBeDefined();
  });

  it('Mellipayamak should works', async () => {
    const result: MellipayamakResponse = await request.sendSms('9357877418', [
      '12345',
    ]);
    expect(result.Value.length).toBeGreaterThanOrEqual(15);
    expect(result.RetStatus).toEqual(1);
    expect(result.StrRetStatus.toUpperCase()).toEqual('OK');
  }, 60000);
});
