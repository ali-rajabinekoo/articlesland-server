import { Test, TestingModule } from '@nestjs/testing';
import { Request } from './request';
import { MellipayamakResponse } from './schemes';

describe('Request service', () => {
  let service: Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Request],
    }).compile();

    service = module.get<Request>(Request);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Mellipayamak should works', async () => {
    const result: MellipayamakResponse = await service.sendSms('9357877418', [
      '12345',
    ]);
    expect(result.Value.length).toBeGreaterThan(15);
    expect(result.RetStatus).toEqual(1);
    expect(result.StrRetStatus.toUpperCase()).toEqual('OK');
  }, 60000);
});
