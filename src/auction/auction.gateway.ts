import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtWsInterceptor } from 'src/auth/JwtWsInterceptor';
import { AuthGuard } from '@nestjs/passport';
import { Auction } from './entity/auction.entity';
import { AuctionService } from './auction.service';
import { AuctionDTO, AuctionJoinDTO } from './dto/auction.dto';

@WebSocketGateway({
  namespace: '/auction',
  cors: {
    origin: ['https://pixeller.net', 'http://pixeller.net'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
})
@UseInterceptors(JwtWsInterceptor)
export class AuctionGateway {
  constructor(private readonly auctionService: AuctionService) {}

  @WebSocketServer()
  server: Server;

  // Sessions
  private users: Map<string, any> = new Map<string, any>();

  @UseGuards(AuthGuard('jwt'))
  @SubscribeMessage('connect')
  handleConnection(@ConnectedSocket() client: Socket): void {
    console.log(`client connected ${client.id}`);
  }

  /**
   * @description: 클라이언트가 경매에 참가했을 때 실행되는 메서드
   */
  @SubscribeMessage('join')
  joinAuction(@ConnectedSocket() client: any, @MessageBody() payload: AuctionJoinDTO): void {
    client.join(payload.room);
    this.users.set(payload.username, payload.room);

    client.broadcast
      .to(payload.room)
      .emit('message', { type: 'join', message: `${payload.username}님이 입장했습니다.` });
    // client.broadcast('message', {type: 'join',message: `${payload.username}님이 ${payload.room} 방의 경매에 참가했습니다.`,});
  }

  @SubscribeMessage('start')
  startAuction(@ConnectedSocket() client: any, @MessageBody() payload: any): void {
    this.server.to(payload.room).emit('message', { type: 'start', message: `경매가 시작됩니다.` });
  }

  @SubscribeMessage('end')
  endAuction(@ConnectedSocket() client: any, @MessageBody() payload: any): void {
    this.server.to(payload.room).emit('message', { type: 'end', message: `경매가 종료됩니다.` });
  }

  /**
   * @description: 클라이언트가 입찰을 했을 때 실행되는 메서드
   */
  @SubscribeMessage('bid')
  async bid(@ConnectedSocket() client: any, @MessageBody() payload: AuctionDTO): Promise<void> {
    const result = await this.auctionService.handleBid(payload);
    const messageType = result.success ? 'bid' : 'error';
    this.server.to(payload.product_id).emit('message', { type: messageType, message: result.message });
  }

  @SubscribeMessage('auction')
  auction(@ConnectedSocket() client: any, @MessageBody() payload: any): void {
    this.server.to(payload.room).emit('message', { type: 'auction', message: payload.message });
  }

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: any, @MessageBody() payload: any): void {
    this.server.to(payload.room).emit('message', { type: 'message', message: payload.message });
  }

  @SubscribeMessage('leave')
  leaveAuction(@ConnectedSocket() client: any, @MessageBody() payload: any): void {
    this.users.delete(payload.username);
    client.leave(payload.room);
    client.emit('message', { type: 'leave', message: 'leaved' });
  }
}
