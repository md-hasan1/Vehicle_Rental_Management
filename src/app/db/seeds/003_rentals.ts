import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('rentals').del();

  const vehicles = await knex('vehicles').select('id').orderBy('id', 'asc');
  if (vehicles.length < 3) return;

  await knex('rentals').insert([
    {
      vehicle_id: vehicles[0].id,
      customer_name: 'Alice Johnson',
      customer_phone: '+1-555-0101',
      start_date: '2026-08-05',
      end_date: '2026-08-09',
      total_amount: 250.0,
      status: 'completed',
    },
    {
      vehicle_id: vehicles[1].id,
      customer_name: 'Bob Smith',
      customer_phone: '+1-555-0202',
      start_date: '2026-07-29',
      end_date: '2026-08-03',
      total_amount: 510.0,
      status: 'completed',
    },
    {
      vehicle_id: vehicles[2].id,
      customer_name: 'Charlie Brown',
      customer_phone: '+1-555-0303',
      start_date: '2026-08-10',
      end_date: '2026-08-19',
      total_amount: 1200.0,
      status: 'booked',
    },
    {
      vehicle_id: vehicles[0].id,
      customer_name: 'Dave Wilson',
      customer_phone: '+1-555-0404',
      start_date: '2026-08-12',
      end_date: '2026-08-14',
      total_amount: 150.0,
      status: 'cancelled',
    },
  ]);
}
