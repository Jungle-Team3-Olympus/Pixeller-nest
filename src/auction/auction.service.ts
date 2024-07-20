import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auction, AuctionResult } from './entity/auction.entity';
import { Repository } from 'typeorm';
import { AuctionDTO } from './dto/auction.dto';
import { User, AuctionRoom } from './interfaces/auction.interface';
import { Server } from 'socket.io';

@Injectable()
export class AuctionService {
  private users: Map<string, User> = new Map<string, User>();
  private rooms: Map<string, AuctionRoom> = new Map<string, AuctionRoom>();
  private server: Server;

  constructor(
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,

    @InjectRepository(AuctionResult)
    private auctionResultRepository: Repository<AuctionResult>,
  ) {}

  setServer(server: Server) {
    this.server = server;
  }

  handleUserJoin(username: string, room: string): AuctionRoom {
    this.users.set(username, { username: username, joinedRoom: room });

    if (!this.rooms.has(room)) {
      this.rooms.set(room, {
        room_id: room,
        room_name: room,
        on_air: false,
        done: false,
        max_bid_price: 0,
        changed: false,
        users: [this.users.get(username)],
        bidTimeOut: null,
        countDownIntervals: null,
      });
    } else {
      const roomData = this.rooms.get(room);
      if (roomData) {
        this.rooms.set(room, {
          ...roomData,
          users: [...roomData.users, this.users.get(username)],
        });
      }
    }
    return this.rooms.get(room);
  }

  handleUserLeave(username: string, room: string): AuctionRoom {
    if (this.rooms.has(room)) {
      const auctionRoom = this.rooms.get(room);
      if (auctionRoom) {
        auctionRoom.users = auctionRoom.users.filter((user) => user.username !== username);
        if (auctionRoom.users.length === 0) {
          this.rooms.delete(room);
        }
      }
      this.users.delete(username);
      return auctionRoom;
    }
    return null;
  }

  handleAuctionStart(room: string, init_price: number): void {
    const auctionRoom = this.rooms.get(room);
    if (auctionRoom) {
      auctionRoom.on_air = true;
      auctionRoom.max_bid_price = init_price;
    }
  }

  handleAuctionEnd(room: string): AuctionRoom {
    const auctionRoom = this.rooms.get(room);
    if (auctionRoom) {
      auctionRoom.on_air = false;
      auctionRoom.done = true;
    }
    return auctionRoom;
  }

  startBidTimeout(room: AuctionRoom): void {
    room.remainingTime = 10;
    room.bidTimeOut = setTimeout(() => {
      this.handleAuctionEnd(room.room_id);
      this.server.to(room.room_id).emit('message', {
        type: 'end',
        message: `[ 낙찰 선언 🎉] "축하합니다! ${room.max_user?.username}님, ${room.max_bid_price}원에 낙찰되셨습니다!"`,
        bid_price: room.max_bid_price,
        winner: room.changed ? room.max_user?.username : '',
      });
    }, 10000);

    room.countDownIntervals = setInterval(() => {
      room.remainingTime -= 1;
      if (room.remainingTime <= 0) {
        clearInterval(room.countDownIntervals);
      } else if (room.remainingTime <= 5) {
        this.server.to(room.room_id).emit('message', {
          type: 'countdown',
          tick: room.remainingTime,
          message: `[경매 종료 임박 ⏳] ${room.remainingTime}초 `,
        });
      }
    }, 1000);
  }

  async create(auction: Auction): Promise<Auction> {
    auction.bid_time = new Date(); // !!!: 추후에 규칙 정해서 DB에 입력.
    return await this.auctionRepository.save(auction);
  }

  async createResult(auctionResult: AuctionResult): Promise<AuctionResult> {
    // 경매 결과 생성 시간을 현재 시간으로 설정,
    // !!!: 해당 member_id가 해당 auction_id에 대한 최대 bid_price를 찾아서 auctionResult.member_id로 설정.

    auctionResult.bid_time = new Date(); // !!!: 추후에 규칙 정해서 DB에 입력.
    return await this.auctionResultRepository.save(auctionResult);
  }

  async findOne(id: string): Promise<string> {
    return `This action returns a #${id} auction`;
  }

  async bid(): Promise<string> {
    return `This action bid a auction`;
  }

  undefinedCheck(toCheck: AuctionDTO): boolean {
    // console.log(toCheck);
    return toCheck.bid_price !== undefined && toCheck.username !== undefined && toCheck.product_id !== undefined;
  }

  async handleBid(
    payload: AuctionDTO,
  ): Promise<{ success: boolean; message: string; bid_price: Number; username: string }> {
    const room = this.rooms.get(payload.product_id);
    if (room && room.on_air && !room.done) {
      if (Number(payload.bid_price) > room.max_bid_price) {
        room.max_bid_price = Number(payload.bid_price);
        room.max_user = this.users.get(payload.username);
        room.changed = true;

        clearTimeout(room.bidTimeOut);
        clearInterval(room.countDownIntervals);
        this.startBidTimeout(room);

        const msg = '[입찰 알림 🔔] ' + payload.username + '님이 ' + payload.bid_price + '원에 입찰하셨습니다!';

        return { success: true, message: msg, bid_price: room.max_bid_price, username: payload.username };
      }
    }
    return { success: false, message: 'bid failed', bid_price: 0, username: '' };

    // const transfer = new Auction();
    // // console.log('handleBid 실행됨', payload);
    // if (this.undefinedCheck(payload)) {
    //   transfer.auction_result_id = null;
    //   transfer.bid_price = Number(payload.bid_price);
    //   transfer.bid_time = new Date();
    //   transfer.member_id = Number(payload.username);
    //   transfer.product_id = Number(payload.product_id);

    //   const msg = '[입찰 알림 🔔] ' + payload.username + '님이 ' + payload.bid_price + '원에 입찰하셨습니다!';

    //   //   await this.create(transfer);
    //   return { success: true, message: msg };
    // } else {
    //   return { success: false, message: 'bid fail!' };
    // }
  }
}
