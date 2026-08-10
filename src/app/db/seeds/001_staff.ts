import type { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  await knex('staff').del();

  const passwordHash = await bcrypt.hash('password123', 12);

  await knex('staff').insert({
    email: 'admin@rental.com',
    password_hash: passwordHash,
    name: 'Admin User',
  });
}
