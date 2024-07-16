import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, isNumber } from 'class-validator';

export class AuctionDTO {
  @ApiProperty()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty()
  @IsNotEmpty()
  member_id: string;

  @ApiProperty()
  @IsNotEmpty()
  bid_price: string;

  @ApiProperty()
  bid_time: Date;
}

export class AuctionJoinDTO {
  @ApiProperty()
  @IsNotEmpty()
  room: string;

  @ApiProperty()
  @IsNotEmpty()
  username: string;
}
