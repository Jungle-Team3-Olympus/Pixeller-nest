import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auction, AuctionResult } from './entity/auction.entity';
import { Repository } from 'typeorm';
import { AuctionDTO } from './dto/auction.dto';

@Injectable()
export class AuctionService {
  constructor(
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,

    @InjectRepository(AuctionResult)
    private auctionResultRepository: Repository<AuctionResult>,
  ) {}

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

  // 경매 시작
  async start(): Promise<string> {
    return `This action start a auction`;
  }

  // 경매 종료
  async end(): Promise<string> {
    // !!!: 경매 종료 시퀀스 로직 작성.
    return `This action end a auction`;
  }

  undefinedCheck(toCheck: AuctionDTO): boolean {
    return toCheck.bid_price !== undefined && toCheck.member_id !== undefined && toCheck.product_id !== undefined;
  }

  async handleBid(payload: AuctionDTO): Promise<{ success: boolean; message: string }> {
    const transfer = new Auction();

    if (!this.undefinedCheck(payload)) {
      transfer.auction_result_id = null;
      transfer.bid_price = Number(payload.bid_price);
      transfer.bid_time = new Date();
      transfer.member_id = Number(payload.member_id);
      transfer.product_id = Number(payload.product_id);

      await this.create(transfer);
      return { success: true, message: 'bid success' };
    } else {
      return { success: false, message: 'bid fail' };
    }
  }
}
