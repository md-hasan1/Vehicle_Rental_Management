import db from '../../db/connection';
import { IReportRow, IReportResponse } from './report.interface';

class ReportService {
  async getMonthlyReport(month: string, vehicleId?: number): Promise<IReportResponse> {
    const monthStart = `${month}-01`;

    const query = db('vehicles as v')
      .select([
        'v.id as vehicle_id',
        'v.name as vehicle_name',
        db.raw('COUNT(r.id)::int as total_bookings'),
        db.raw(
          `
          COALESCE(
            SUM(
              (LEAST(r.end_date, (DATE_TRUNC('month', ?::date) + INTERVAL '1 month - 1 day')::date)
               - GREATEST(r.start_date, ?::date)
               + 1)
            ), 0
          )::int AS days_rented
        `,
          [monthStart, monthStart],
        ),
        db.raw(
          `
          COALESCE(
            SUM(
              (LEAST(r.end_date, (DATE_TRUNC('month', ?::date) + INTERVAL '1 month - 1 day')::date)
               - GREATEST(r.start_date, ?::date)
               + 1)
              * v.daily_rate
            ), 0
          )::numeric(10,2) AS revenue
        `,
          [monthStart, monthStart],
        ),
      ])
      .leftJoin('rentals as r', function () {
        this.on('r.vehicle_id', '=', 'v.id')
          .andOn('r.status', '!=', db.raw('?', ['cancelled']))
          .andOn(
            'r.start_date',
            '<=',
            db.raw(`(DATE_TRUNC('month', ?::date) + INTERVAL '1 month - 1 day')::date`, [
              monthStart,
            ]),
          )
          .andOn('r.end_date', '>=', db.raw('?::date', [monthStart]));
      })
      .whereNull('v.deleted_at')
      .groupBy('v.id', 'v.name')
      .orderBy('revenue', 'desc');

    if (vehicleId) {
      query.where('v.id', vehicleId);
    }

    const rows = (await query) as unknown as IReportRow[];

    const vehicles: IReportRow[] = rows.map((row) => ({
      vehicle_id: row.vehicle_id,
      vehicle_name: row.vehicle_name,
      total_bookings: Number(row.total_bookings),
      days_rented: Number(row.days_rented),
      revenue: parseFloat(String(row.revenue)),
    }));

    const topEarner = vehicles.length > 0 && vehicles[0].revenue > 0 ? vehicles[0] : null;

    return {
      month,
      vehicles,
      top_earner: topEarner,
    };
  }
}

export const ReportServices = new ReportService();
