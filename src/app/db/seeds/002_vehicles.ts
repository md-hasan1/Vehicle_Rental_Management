import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('rentals').del();
  await knex('vehicles').del();

  await knex('vehicles').insert([
    { name: 'Toyota Camry', plate_number: 'ABC-1234', category: 'sedan', daily_rate: 50.0 },
    { name: 'Ford Explorer', plate_number: 'DEF-5678', category: 'suv', daily_rate: 85.0 },
    { name: 'Mercedes Sprinter', plate_number: 'GHI-9012', category: 'van', daily_rate: 120.0 },
  ]);
}
