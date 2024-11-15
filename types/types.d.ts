interface ICart {
  cart: {
    b12: number;
    b19: number;
  };
}

interface IUser {
  _id: string;
  dailyWater: number;
  fullName?: string;
  userName?: string;
  phone?: string;
  mail?: string;
  subscription?: string;
  addresses?: IAddress[];
  opForm?: "card" | "cash" | "online";
  chooseTime?: boolean;
  price12?: number;
  price19?: number;
  bonus?: number;
  cart?: {
    b12: number;
    b19: number;
  };
  haveCompletedOrder?: boolean;
}

interface IAddress {
  _id?: string;
  mail?: string;
  city: string;
  street: string;
  house: string;
  link: string;
}

interface IOrder {
  _id: string;
  client: string;
  clientNotes: string;
  createdAt: string;
  date: {
    d: string;
    time: string;
  };
  history: string;
  opForm?: "card" | "cash" | "online";
  products: {
    b12: number;
    b19: number;
  };
  status: "awaitingOrder" | "onTheWay" | "delivered" | "cancelled";
  sum: number;
  transferred: boolean;
  updatedAt: string;
  address: {
    actual: string;
    link: string;
  };
}
