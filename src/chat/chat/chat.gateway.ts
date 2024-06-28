import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001, {
  cors: {
    origin: ['http://localhost:3000', 'http://192.168.0.109:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  users: {}[] = [];

  constructor() {
    setInterval(() => {
      this.server.emit('message', { type: 'move', users: this.users });
    }, 5000); // 5초마다 메시지를 보냅니다.
  }

  @SubscribeMessage('connect')
  handleConnection(client: Socket): void {
    console.log(`client connected ${client.id}`);
    // send msg except just connected client
    client.broadcast.emit('message', { uid: `${client.id}`, type: 'newplayer' });
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string, client: Socket): void {
    this.server.emit('message', message);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { username: string }, client: Socket): void {
    console.log(data);
    const welcomeMessage = `${data.username} has joined the chat`;
    // 사용자 정보를 users 배열에 추가
    this.users.push({ username: data.username, x: 1, y: 1 });
    this.server.emit('message', { type: 'newplayer', text: welcomeMessage });
  }

  @SubscribeMessage('leave')
  handleLeave(@MessageBody() data: { username: string }, client: Socket): void {
    const farewellMessage = `${data.username} has left the chat`;
    this.server.emit('message', farewellMessage);
  }
  @SubscribeMessage('move')
  handleMove(@MessageBody() data: {}, client: Socket): void {
    this.users.forEach((user: { username: string; x: number; y: number }) => {
      if (user.username === data['username']) {
        user.x = data['x'];
        user.y = data['y'];
      }
    });
  }
}
