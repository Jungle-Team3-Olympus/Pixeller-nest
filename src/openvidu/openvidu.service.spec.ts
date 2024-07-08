import { Test, TestingModule } from '@nestjs/testing';
import { OpenViduService } from './openvidu.service';

describe('OpenViduService', () => {
  let service: OpenViduService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenViduService],
    }).compile();

    service = module.get<OpenViduService>(OpenViduService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
