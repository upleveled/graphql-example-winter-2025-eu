import type { Sql } from 'postgres';

const animals = [
  {
    id: 1,
    firstName: 'Lucia',
    type: 'Cat',
    accessory: 'House',
  },
  {
    id: 2,
    firstName: 'Bili',
    type: 'Capybaras',
    accessory: 'Car',
  },
  {
    id: 3,
    firstName: 'Jojo',
    type: 'Dog',
    accessory: 'Bike',
  },
  {
    id: 4,
    firstName: 'Macca',
    type: 'Elephant',
    accessory: 'Key',
  },
  {
    id: 5,
    firstName: 'Fro',
    type: 'Duck',
    accessory: 'Motor',
  },
];

export async function up(sql: Sql) {
  for (const animal of animals) {
    await sql`
      INSERT INTO
        animals (
          first_name,
          type,
          accessory
        )
      VALUES
        (
          ${animal.firstName},
          ${animal.type},
          ${animal.accessory}
        )
    `;
  }
}

export async function down(sql: Sql) {
  for (const animal of animals) {
    await sql`
      DELETE FROM animals
      WHERE
        id = ${animal.id}
    `;
  }
}
