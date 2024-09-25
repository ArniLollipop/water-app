interface ICart {
  cart: {
    b12: number;
    b19: number;
  };
}

interface IUser {
  fullName?: string;
  phone?: string;
  mail?: string;
  subscription?: string;
  addresses?: IAddress[];
  opForm?: "card" | "cash" | "online";
  chooseTime?: boolean;
  cart?: {
    b12: number;
    b19: number;
  };
}

interface IAddress {
  _id?: string;
  mail?: string;
  city: string;
  street: string;
  house: string;
  link: string;
}
