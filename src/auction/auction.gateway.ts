import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtWsInterceptor } from 'src/auth/JwtWsInterceptor';
import { AuthGuard } from '@nestjs/passport';
import { Auction } from './entity/auction.entity';
import { AuctionService } from './auction.service';
import { AuctionDTO, AuctionJoinDTO } from './dto/auction.dto';

interface User {
  username: string;
  joinedRoom: string;
}

interface AuctionObject {
  room_id: string;
  room_name: string;
  started: boolean;
  max_bid_price: number;
  max_user?: User;
  users: User[];
}

@WebSocketGateway({
  namespace: '/auction',
  cors: {
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
})
// @UseInterceptors(JwtWsInterceptor)
export class AuctionGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly auctionService: AuctionService) {}

  // Sessions
  private users: Map<string, User> = new Map<string, User>();
  private rooms: Map<string, AuctionObject> = new Map<string, AuctionObject>();
  /**
   * <----- Room <hash> ----->
   * | room_id | room_name | started? (y/n)  | max_bid_price | max_user | users | ever started? | end_time | start_time |  ... |
   * |---------|-----------|-----------------|---------------|----------|-------| --------------| -------- | ---------- | ---- |
   * |    1    |  room_1   |        y        |     10000     |          |  ...  | ...           |  ...     |  ...       |  ... |
   * |    2    |  room_2   |        n        |     20000     |          |  ...  | ...           |  ...     |  ...       |  ... |
   * |    3    |  room_3   |        n        |     30000     |          |  ...  | ...           |  ...     |  ...       |  ... |
   *
   */

  // @UseGuards(AuthGuard('jwt'))
  @SubscribeMessage('connect')
  handleConnection(@ConnectedSocket() client: Socket): void {
    console.log(`auction socket client connected ${client.id}`);
    // console.log('user 출력', this.users);
    // console.log('room 출력', this.rooms);
  }

  /**
   * @description: 클라이언트가 경매에 참가했을 때 실행되는 메서드
   */
  @SubscribeMessage('join')
  joinAuction(@ConnectedSocket() client: any, @MessageBody() payload: AuctionJoinDTO): void {
    console.log('join 실행됨');

    this.users.set(payload.username, { username: payload.username, joinedRoom: payload.room });

    if (!this.rooms.has(payload.room)) {
      this.rooms.set(payload.room, {
        room_id: payload.room,
        room_name: payload.room,
        started: false,
        max_bid_price: 0,
        users: [this.users.get(payload.username)],
      });
    } else {
      const room = this.rooms.get(payload.room);
      if (room) {
        this.rooms.set(payload.room, {
          ...room,
          users: [...room.users, this.users.get(payload.username)],
        });
      }
    }

    client.join(payload.room);
    client.emit('message', {
      type: 'join',
      message: `you joined at ${payload.room}.`,
      started: this.rooms.get(payload.room).started,
    });
    client.broadcast
      .to(payload.room)
      .emit('message', { type: 'join', message: `${payload.username}님이 입장했습니다.` });
    // console.log('user 출력', this.users);
    // console.log('room 출력', this.rooms);
    // console.log('room users 출력', this.rooms.get(payload.room)?.users);
  }

  @SubscribeMessage('start')
  startAuction(@ConnectedSocket() client: any, @MessageBody() payload: any): void {
    console.log('start 실행됨');
    this.rooms.get(payload.room).started = true;
    this.server.to(payload.room).emit('message', { type: 'start', message: `경매가 시작됩니다.` });
  }

  @SubscribeMessage('end')
  endAuction(@ConnectedSocket() client: any, @MessageBody() payload: any): void {
    console.log('end 실행됨');

    const room = this.rooms.get(payload.room);
    room.started = false;

    this.server.to(payload.room).emit('message', {
      type: 'end',
      message: `경매가 종료됩니다.`,
      bid_price: room.max_bid_price,
      winner: room.max_user.username,
    });
  }

  /**
   * @description: 클라이언트가 입찰을 했을 때 실행되는 메서드
   */
  @SubscribeMessage('bid')
  async bid(@ConnectedSocket() client: any, @MessageBody() payload: AuctionDTO): Promise<void> {
    console.log('bid 실행됨');
    const result = await this.auctionService.handleBid(payload);
    const messageType = result.success ? 'bid' : 'error';
    const room = this.rooms.get(payload.product_id);
    if (room) {
      if (Number(payload.bid_price) > room.max_bid_price) {
        room.max_bid_price = Number(payload.bid_price);
        room.max_user = this.users.get(payload.username);
      }
    }
    this.server
      .to(payload.product_id)
      .emit('message', { type: messageType, message: result.message, bid_price: room.max_bid_price });
    // console.log('bid :', room.max_bid_price);
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
    console.log('leave 실행됨');

    // auction Service 안으로 이동
    if (this.rooms.has(payload.room)) {
      const room = this.rooms.get(payload.room);
      console.log('room 출력', room);
      if (room) {
        this.rooms.set(payload.room, {
          ...room,
          users: room.users.filter((user) => user.username !== payload.username),
        });
        if (room.users.length === 0) {
          this.rooms.delete(payload.room);
        }
      }
    }
    client.leave(payload.room);
    this.users.delete(payload.username);
    client.emit('message', { type: 'leave', message: 'leaved' });
    // console.log('user 출력', this.users);
    // console.log('room 출력', this.rooms);
    // console.log('room users 출력', this.rooms.get(payload.room)?.users);
  }
}
