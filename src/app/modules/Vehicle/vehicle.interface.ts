export interface IVehicle {
  id: number;
  name: string;
  plate_number: string;
  category: string;
  daily_rate: number;
  photo_path: string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateVehicleBody {
  name: string;
  plate_number: string;
  category: string;
  daily_rate: number;
}

export interface IUpdateVehicleBody {
  name?: string;
  plate_number?: string;
  category?: string;
  daily_rate?: number;
}

export interface IVehicleFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}
