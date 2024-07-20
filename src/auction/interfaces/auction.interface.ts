// interfaces/auction-room.interface.ts
export interface User {
  username: string;
  joinedRoom: string;
}

export interface AuctionRoom {
  room_id: string;
  room_name: string;
  on_air: boolean;
  done: boolean;
  max_bid_price: number;
  max_user?: User;
  changed: boolean;
  users: User[];
  bidTimeOut: NodeJS.Timeout;
  countDownIntervals: NodeJS.Timeout;
  remainingTime?: number;
}
