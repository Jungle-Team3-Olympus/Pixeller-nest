import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Auction {
  @PrimaryGeneratedColumn()
  auction_id: number;
  @Column({ type: 'int', nullable: false })
  product_id: number;
  @Column({ type: 'int', nullable: false })
  member_id: number;
  @Column({ type: 'datetime', nullable: false })
  bid_time: Date;

  // 경매 결과가 없을 수도 있다.
  @Column({ type: 'int', nullable: true })
  auction_result_id: number;
  @Column({ type: 'int', nullable: true })
  bid_price: number;
}

@Entity()
export class AuctionResult {
  @PrimaryGeneratedColumn()
  auction_result_id: number;
  @Column({ type: 'int', nullable: false })
  auction_id: number;
  @Column({ type: 'int', nullable: false })
  member_id: number;
  @Column({ type: 'int', nullable: false })
  product_id: number;
  @Column({ type: 'int', nullable: false })
  seller_id: number;

  // 낙찰가
  @Column({ type: 'int', nullable: false })
  bid_price: number;
  // 경매 종료 시간
  @Column({ type: 'datetime', nullable: false })
  bid_time: Date;
}
