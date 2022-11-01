import request, { Request } from './request';
import { MellipayamakResponse } from './schemas';

describe('Request service', () => {
  let service: Request;

  beforeAll(() => {
    service = request;
  });

  it('should be defined', () => {
    expect(request).toBeDefined();
  });

  it('Mellipayamak should works', async () => {
    const response = new MellipayamakResponse();
    response.Value = '123456789123456789123456789';
    response.StrRetStatus = 'Ok';
    response.RetStatus = 1;
    return response;

    const sendSmsSpy = jest
      .spyOn(service, 'sendSms')
      .mockImplementation(async (): Promise<MellipayamakResponse> => response);

    const result: MellipayamakResponse = await service.sendSms('9357877418', [
      '12345',
    ]);
    expect(result.Value.length).toBeGreaterThanOrEqual(15);
    expect(result.RetStatus).toEqual(1);
    expect(result.StrRetStatus.toUpperCase()).toEqual('OK');
    expect(sendSmsSpy).toBeCalledTimes(1);
    expect(sendSmsSpy).toBeCalledWith('9357877418', ['12345']);
  }, 60000);
});
