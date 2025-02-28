import { cache } from 'react';
import { postgresToGraphql } from '../graphql/transform';
import type { Animal } from '../migrations/00000-createTableAnimals';
import { sql } from './connect';

// Secure database queries start here
// All queries not marked `Insecure` use session tokens to authenticate the user

export const createAnimal = cache(
  async (sessionToken: string, newAnimal: Omit<Animal, 'id'>) => {
    const [animal] = await sql<Animal[]>`
      INSERT INTO
        animals (first_name, type, accessory) (
          SELECT
            ${newAnimal.firstName},
            ${newAnimal.type},
            ${newAnimal.accessory}
          FROM
            sessions
          WHERE
            token = ${sessionToken}
            AND sessions.expiry_timestamp > now()
        )
      RETURNING
        animals.*
    `;

    return postgresToGraphql(animal);
  },
);

export const updateAnimal = cache(
  async (sessionToken: string, updatedAnimal: Animal) => {
    const [animal] = await sql<Animal[]>`
      UPDATE animals
      SET
        first_name = ${updatedAnimal.firstName},
        type = ${updatedAnimal.type},
        accessory = ${updatedAnimal.accessory}
      FROM
        sessions
      WHERE
        sessions.token = ${sessionToken}
        AND sessions.expiry_timestamp > now()
        AND animals.id = ${updatedAnimal.id}
      RETURNING
        animals.*
    `;
    return postgresToGraphql(animal);
  },
);

export const deleteAnimal = cache(async (sessionToken: string, id: number) => {
  const [animal] = await sql<Animal[]>`
    DELETE FROM animals USING sessions
    WHERE
      sessions.token = ${sessionToken}
      AND sessions.expiry_timestamp > now()
      AND animals.id = ${id}
    RETURNING
      animals.*
  `;

  return postgresToGraphql(animal);
});

// Insecure database queries start here
// All queries marked `Insecure` do not use session tokens to authenticate the user

export const getAnimalsInsecure = cache(async () => {
  const animals = await sql<Animal[]>`
    SELECT
      *
    FROM
      animals
    ORDER BY
      id
  `;

  // return animals;
  return animals.map(postgresToGraphql);
});

export const getAnimalInsecure = cache(async (id: number) => {
  const [animal] = await sql<Animal[]>`
    SELECT
      *
    FROM
      animals
    WHERE
      id = ${id}
  `;

  // return animal;
  return postgresToGraphql(animal);
});

export const createAnimalInsecure = cache(
  async (newAnimal: Omit<Animal, 'id'>) => {
    const [animal] = await sql<Animal[]>`
      INSERT INTO
        animals (first_name, type, accessory)
      VALUES
        (
          ${newAnimal.firstName},
          ${newAnimal.type},
          ${newAnimal.accessory}
        )
      RETURNING
        animals.*
    `;

    // return animal;
    return postgresToGraphql(animal);
  },
);

export const updateAnimalInsecure = cache(async (updatedAnimal: Animal) => {
  const [animal] = await sql<Animal[]>`
    UPDATE animals
    SET
      first_name = ${updatedAnimal.firstName},
      type = ${updatedAnimal.type},
      accessory = ${updatedAnimal.accessory}
    WHERE
      id = ${updatedAnimal.id}
    RETURNING
      animals.*
  `;

  // return animal;
  return postgresToGraphql(animal);
});

export const deleteAnimalInsecure = cache(async (animalId: Animal['id']) => {
  const [animal] = await sql<Animal[]>`
    DELETE FROM animals
    WHERE
      id = ${animalId}
    RETURNING
      animals.*
  `;

  // return animal;
  return postgresToGraphql(animal);
});
