import { Body, Controller, HttpStatus, Post, Res, Headers } from '@nestjs/common';
import { OpenViduService } from './openvidu.service';

@Controller('openvidu')
export class OpenviduController {
  constructor(private readonly openviduService: OpenViduService) {}

  @Post('token')
  async generateToken(@Body() body: { roomName: string; participantName: string }, @Res() res) {
    const { roomName, participantName } = body;

    if (!roomName || !participantName) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'roomName and participantName are required' });
    }

    const token = this.openviduService.generateToken(roomName, participantName);
    return res.status(HttpStatus.OK).json({ token });
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any, @Headers('Authorization') authorization: string, @Res() res) {
    try {
      const event = await this.openviduService.handleWebhook(body, authorization);
      console.log(event);
    } catch (error) {
      console.error('Error validating webhook event', error);
    }
    return res.status(HttpStatus.OK).send();
  }
}
