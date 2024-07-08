// import { Injectable } from '@nestjs/common';
// import { AccessToken, WebhookReceiver } from 'livekit-server-sdk';

// @Injectable()
// export class OpenviduService {
//   private readonly LIVEKIT_API_KEY: string = process.env.LIVEKIT_API_KEY;
//   private readonly LIVEKIT_API_SECRET: string = process.env.LIVEKIT_API_SECRET;
//   private webhookReceiver: WebhookReceiver;

//   constructor() {
//     this.webhookReceiver = new WebhookReceiver(this.LIVEKIT_API_KEY, this.LIVEKIT_API_SECRET);
//   }

//   async generateToken(roomName: string, participantName: string): Promise<string> {
//     const at = new AccessToken(this.LIVEKIT_API_KEY, this.LIVEKIT_API_SECRET, {
//       identity: participantName,
//     });
//     at.addGrant({ roomJoin: true, room: roomName });
//     return at.toJwt();
//   }

//   async handleWebhook(body: any, authorization: string) {
//     return await this.webhookReceiver.receive(body, authorization);
//   }
// }

import { Injectable } from '@nestjs/common';
import * as livekitSDK from 'livekit-server-sdk';

@Injectable()
export class OpenViduService {
  private readonly LIVEKIT_API_KEY: string;
  private readonly LIVEKIT_API_SECRET: string;
  private webhookReceiver: any;

  constructor() {
    this.LIVEKIT_API_KEY = process.env.LiVEKIT_API_KEY;
    this.LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
    this.initializeLivekitSDK();
  }

  private async initializeLivekitSDK() {
    const { WebhookReceiver } = livekitSDK;
    this.webhookReceiver = new WebhookReceiver(this.LIVEKIT_API_KEY, this.LIVEKIT_API_SECRET);
  }

  async generateToken(roomName: string, participantName: string): Promise<string> {
    const { AccessToken } = livekitSDK;
    const at = new AccessToken(this.LIVEKIT_API_KEY, this.LIVEKIT_API_SECRET, {
      identity: participantName,
    });
    at.addGrant({ roomJoin: true, room: roomName });
    return at.toJwt();
  }

  async handleWebhook(body: any, authorization: string) {
    return await this.webhookReceiver.receive(body, authorization);
  }
}
