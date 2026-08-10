export enum RentalStatus {
  BOOKED = 'booked',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface IRental {
  id: number;
  vehicle_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: Date;
  end_date: Date;
  total_amount: number;
  status: RentalStatus;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateRentalBody {
  vehicle_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
}

export interface IUpdateRentalBody {
  vehicle_id?: number;
  customer_name?: string;
  customer_phone?: string;
  start_date?: string;
  end_date?: string;
  status?: RentalStatus;
}

export interface IRentalFilters {
  vehicle_id?: number;
  status?: RentalStatus;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}
