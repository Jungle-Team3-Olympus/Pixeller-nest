import { Module } from '@nestjs/common';
import { OpenviduController } from './openvidu.controller';
import { OpenViduService } from './openvidu.service';

@Module({
  imports: [],
  controllers: [OpenviduController],
  providers: [OpenViduService],
})
export class OpenviduModule {}
