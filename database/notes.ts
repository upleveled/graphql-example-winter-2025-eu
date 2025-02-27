import { cache } from 'react';
import { postgresToGraphql } from '../graphql/transform';
import type { Note } from '../migrations/00003-createTableNotes';
import type { Session } from '../migrations/00004-createTableSessions';
import { sql } from './connect';

export const getNotes = cache(async (sessionToken: Session['token']) => {
  const notes = await sql<Note[]>`
    SELECT
      notes.*
    FROM
      notes
      INNER JOIN sessions ON (
        sessions.token = ${sessionToken}
        AND sessions.user_id = notes.user_id
        AND expiry_timestamp > now()
      )
  `;
  return notes;
});

export const getNote = cache(
  async (sessionToken: Session['token'], noteId: Note['id']) => {
    const [note] = await sql<Note[]>`
      SELECT
        notes.*
      FROM
        notes
        INNER JOIN sessions ON (
          sessions.token = ${sessionToken}
          AND sessions.user_id = notes.user_id
          AND expiry_timestamp > now()
        )
      WHERE
        notes.id = ${noteId}
    `;
    return note;
  },
);

export async function selectNoteExists(noteId: Note['id']) {
  const [record] = await sql<{ exists: boolean }[]>`
    SELECT
      EXISTS (
        SELECT
          TRUE
        FROM
          notes
        WHERE
          id = ${noteId}
      )
  `;

  return Boolean(record?.exists);
}

export const createNote = cache(
  async (
    sessionToken: Session['token'],
    title: Note['title'],
    textContent: Note['textContent'],
  ) => {
    const [note] = await sql<Note[]>`
      INSERT INTO
        notes (user_id, title, text_content) (
          SELECT
            user_id,
            ${title},
            ${textContent}
          FROM
            sessions
          WHERE
            token = ${sessionToken}
            AND sessions.expiry_timestamp > now()
        )
      RETURNING
        notes.*
    `;

    return postgresToGraphql(note);
  },
);
