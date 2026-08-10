export interface ILoginBody {
  email: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
  staff: {
    id: number;
    email: string;
    name: string;
  };
}

export interface IStaff {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}
