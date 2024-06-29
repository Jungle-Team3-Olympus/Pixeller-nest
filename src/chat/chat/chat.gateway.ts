import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001, {
  cors: {
    origin: ['http://localhost:3000', 'http://192.168.0.96:3000', 'http://172.23.176.1:3000'],
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
  users: {}[] = [];

  constructor() {
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
    client.emit('message', { uid: client.id, type: 'syncUser', users:this.users });
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): void {
    this.server.emit('message', message);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { username: string }, @ConnectedSocket() client: Socket): void {
    // console.log(this.users);
    const welcomeMessage = `${data.username} has joined the chat`;

    // 사용자 정보를 users 배열에 추가
    this.users.push({ uid: client.id, username: data.username, x: 1, y: 1 });
    this.server.emit('message', {
      username: data.username,
      type: 'newplayer',
      text: welcomeMessage,
      uid: client.id,
    });
  }

  @SubscribeMessage('leave')
  handleLeave(@MessageBody() data: { username: string }, client: Socket): void {
    const farewellMessage = `${data.username} has left the chat`;

    // 사용자 정보를 users 배열에서 삭제, username으로 삭제
    // this.users = this.users.filter((user: { username: string }) => user.username !== data.username);

    // 사용자 정보를 users 배열에서 삭제, clientId로 삭제
    this.users = this.users.filter((user: { uid: string }) => user.uid !== client.id);

    this.server.emit('message', { type: 'leave', text: farewellMessage, uid: client.id });
  }

  @SubscribeMessage('move')
  handleMove(@MessageBody() data: {}): void {
    this.users.forEach((user: { username: string; x: number; y: number; clientId: string; direction: string }) => {
      if (user.clientId === data['clientId']) {
        user.x = data['x'];
        user.y = data['y'];
        user.direction = data['direction'];
        user.username = data['username'];
      }
    });
    this.server.emit('message', { type: 'move', users: this.users });
  }
}
