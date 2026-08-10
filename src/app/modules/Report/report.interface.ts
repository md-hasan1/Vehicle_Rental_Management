export interface IReportRow {
  vehicle_id: number;
  vehicle_name: string;
  total_bookings: number;
  days_rented: number;
  revenue: number;
}

export interface IReportResponse {
  month: string;
  vehicles: IReportRow[];
  top_earner: IReportRow | null;
}
