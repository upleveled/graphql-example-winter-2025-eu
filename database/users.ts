import { cache } from 'react';
import { postgresToGraphql } from '../graphql/transform';
import type { User } from '../migrations/00002-createTableUsers';
import type { Session } from '../migrations/00004-createTableSessions';
import { sql } from './connect';

// Security: Minimize surface area with password hash
type UserWithPasswordHash = User & {
  passwordHash: string;
};

// Secure database queries start here
// All queries not marked `Insecure` use session tokens to authenticate the user

export const getUser = cache(async (sessionToken: Session['token']) => {
  const [user] = await sql<Pick<User, 'username'>[]>`
    SELECT
      users.username
    FROM
      users
      INNER JOIN sessions ON (
        sessions.token = ${sessionToken}
        AND users.id = sessions.user_id
        AND expiry_timestamp > now()
      )
  `;
  return user;
});

// Insecure database queries start here
// All queries marked `Insecure` do not use session tokens to authenticate the user

export const getUserInsecure = cache(async (username: User['username']) => {
  const [user] = await sql<User[]>`
    SELECT
      users.id,
      users.username
    FROM
      users
    WHERE
      username = ${username.toLowerCase()}
  `;
  return user;
});

export const getUserWithPasswordHashInsecure = cache(
  async (username: User['username']) => {
    const [user] = await sql<UserWithPasswordHash[]>`
      SELECT
        *
      FROM
        users
      WHERE
        username = ${username.toLowerCase()}
    `;
    return user;
  },
);

export const createUserInsecure = cache(
  async (
    username: User['username'],
    passwordHash: UserWithPasswordHash['passwordHash'],
  ) => {
    const [user] = await sql<User[]>`
      INSERT INTO
        users (username, password_hash)
      VALUES
        (
          ${username.toLowerCase()},
          ${passwordHash}
        )
      RETURNING
        users.id,
        users.username
    `;
    return postgresToGraphql(user);
  },
);
