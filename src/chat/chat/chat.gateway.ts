import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../../user/user.service';
import { Member as UserEntity } from '../../user/entity/user.entity';


interface User {
  uid: string;
  username: string;
  x: number;
  y: number;
  direction?: string;
}

@WebSocketGateway(3001, {
  cors: {
    origin: ['http://localhost:3000', 'http://192.168.0.109:3000', 'http://192.168.0.145:3000', 'http://192.168.0.103:3000', 'http://192.168.0.100:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
})
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
  // users: {}[] = [];
  users: Map<string, User> = new Map<string, User>();
  uidNum:number = 0;

  constructor( private readonly userService: UserService ) {
    // setInterval(() => {
    //   this.server.emit('message', { type: 'move', users: this.users });
    // }, 10); // 5초마다 메시지를 보냅니다.
  }

  /**
   * @description 클라이언트가 연결되었을 때 실행되는 메서드 + 클라이언트에게 uid 전송, type: connect
   * @param client client socket
   */
  @SubscribeMessage('connect')
  handleConnection(client: Socket): void {
    console.log(`client connected ${client.id}`);
    // send msg to client
    client.emit('message', { uid: client.id, type: 'syncUser', users: Array.from(this.users.values()) });
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): void {
    this.server.emit('message', message);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { username: string }, @ConnectedSocket() client: Socket): void {
    const welcomeMessage = `${data.username} has joined the chat`;
    console.log(welcomeMessage);
    console.log(this.users);
    // 사용자 정보를 users 배열에 추가
    // this.users.push({ uid: client.id, username: data.username, x: 1, y: 1 });
    if (this.users.get(data.username) === undefined) {
      console.log('실행');
      this.users.set(data.username, {
        uid: data.username,
        username: data.username,
        x: 64,
        y: 64,
      });
    }

    client.broadcast.emit('message', {
      username: data.username,
      type: 'join',
      uid: data.username,
      users: Array.from(this.users.values()),
      text: welcomeMessage,
    });
  }

  @SubscribeMessage('leave')
  handleLeave(@MessageBody() data: { username: string }, client: Socket): void {
    const farewellMessage = `${data.username} has left the chat`;
    console.log(farewellMessage);

    // 사용자 정보를 users 배열에서 삭제, clientId로 삭제
    // this.users = this.users.filter((user: { uid: string }) => user.uid !== client.id);
    this.users.delete(data.username);

    this.server.emit('message', { type: 'leave', text: farewellMessage, uid: data.username });
  }

  @SubscribeMessage('move')
  handleMove(@MessageBody() data: {}, @ConnectedSocket() client: Socket): void {
    const user = this.users.get(data['uid']);
    if (user) {
      user.x = data['x'];
      user.y = data['y'];
      user.direction = data['direction'];
      user.username = data['username'];
    }
    this.users.set(data['uid'], user);
    client.broadcast.emit('message', { type: 'move', user: user });
    // client.broadcast.emit('message', { type: 'move', users: Array.from(this.users.values()) });
    // client.broadcast.emit('message', { type: 'move', users: this.users });
    // this.server.emit('message', { type: 'move', users: this.users });
  }
}
