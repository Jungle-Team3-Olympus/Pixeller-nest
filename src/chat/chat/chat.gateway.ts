import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../../user/user.service';
import { Member as UserEntity } from '../../user/entity/user.entity';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtWsInterceptor } from 'src/auth/JwtWsInterceptor';
import { JwtService } from '@nestjs/jwt';

interface User {
  uid: string;
  username: string;
  client_id: string;
  x: number;
  y: number;
  direction?: string;
}

@WebSocketGateway({
  namespace: '/ws',
  cors: {
    origin: ['http://pixeller.net', 'https://pixeller.net', 'http//192.168.0.96:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
})
@UseInterceptors(JwtWsInterceptor)
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  /**
   * 사용자 정보를 저장할 배열
   * @type {JSON[]}
   * @memberof ChatGateway
   * @example { username: string, x: number, y: number, client: string, direction: string }
   * @description 사용자 정보를 저장할 배열
   */
  
  users: Map<string, User> = new Map<string, User>();
  uidNum: number = 0;

  constructor( 
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    // setInterval(() => {
    //   this.server.emit('message', { type: 'move', users: this.users });
    // }, 10); // 5초마다 메시지를 보냅니다.
  }

  /**
   * @description 클라이언트가 연결되었을 때 실행되는 메서드 + 클라이언트에게 uid 전송, type: connect
   * @param client client socket
   */
  @UseGuards(AuthGuard('jwt'))
  @SubscribeMessage('connect')
  handleConnection(client: Socket): void {
    console.log(`client connected ${client.id}`);
    client.emit('message', { uid: client.id, type: 'syncUser', users: Array.from(this.users.values())});
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): void {
    this.server.emit('message', message);
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket): void {

    // console.log(client.handshake['invalidToken']);
    // if(client.handshake['invalidToken']){ 
    //   client.emit('error', { message: 'Invalid token', code: '401' });
    //   return; 
    // }

    const data = client.handshake['user'];
    const welcomeMessage = `${data.id} has joined the chat`;
    let x = 64;
    let y = 64;

    this.userService.getUserPosition(data.uid).then((result: UserEntity) => {
      console.log('result', result);
      console.log('result !== null', result !== null);
      if (result !== null) {
        x = result.x,
        y = result.y,
        this.users.set(data.uid, {
          uid: data.uid,
          username: data.id,
          client_id: client.id,
          x: result.x,
          y: result.y,
          direction: result.direction,
        });
      } else {
        this.users.set(data.uid, {
          uid: data.uid,
          username: data.id,
          client_id: client.id,
          x: 64,
          y: 64,
        });
      }
    }).finally(() => {
      client.broadcast.emit('message', {
        username: data.id,
        type: 'join',
        uid: data.uid,
        user: this.users.get(data.uid),
        text: welcomeMessage,
      });
      client.emit('message', { uid: client.id, type: 'syncMe', x: x, y: y });

    });

  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket): void {
    const data = client.handshake['user'];
    const farewellMessage = `${data.id} has left the chat`;
    // 사용자 정보를 users 배열에서 삭제, clientId로 삭제
    // this.users = this.users.filter((user: { uid: string }) => user.uid !== client.id);
    this.users.delete(data.uid);

    this.server.emit('message', { type: 'leave', text: farewellMessage, uid: data.uid });
  }

  @SubscribeMessage('move')
  handleMove(@MessageBody() data: {}, @ConnectedSocket() client: Socket): void {
    const session = client.handshake['user'];
    const user = this.users.get(session.uid);
    if (user) {
      user.x = data['x'];
      user.y = data['y'];
      user.direction = data['direction'];
      user.username = session.id;
    }
    client.broadcast.emit('message', { type: 'move', user: user });
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(client: Socket): void {
    const data = client.handshake['user'];
    // console.log(`client disconnected ${data.uid}`);
    if(data === undefined) return;
    const x = this.users.get(data.uid).x;
    const y = this.users.get(data.uid).y;

    this.userService.setUserPosition(data.uid, x, y);
    // 유저 위치정보 동기화를 위한 위치정보 업데이트
    this.users.delete(data.uid);
    client.broadcast.emit('message', { type: 'leave', uid: data.uid });
  }

  
  @SubscribeMessage('refreshToken')
  handleRefreshToken(@MessageBody() newToken: string, @ConnectedSocket() client: Socket): void {
    try {
      const decoded = this.jwtService.verify(newToken);
      // Attach the user to the context
      client.handshake['auth']['token'] = newToken;
      client.handshake['user'] = decoded;
    } catch (err) {
      client.emit('error', { message: 'Unauthorized' });
      throw new WsException('Unauthorized');
    }
  }

  @SubscribeMessage('userList')
  handleUserList(@ConnectedSocket() client: Socket): void {
    console.log('userList 이벤트 발생!');
    console.log('userList', Array.from(this.users.values()));
    client.emit('message', { type: 'userList', users: Array.from(this.users.values()) });
  }


}
