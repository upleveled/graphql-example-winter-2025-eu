'use client';

import { gql, useMutation } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Note } from '../../migrations/00003-createTableNotes';
import ErrorMessage from '../ErrorMessage';
import styles from './NotesForm.module.scss';

type Props = {
  notes: Note[];
  username: string;
};

const createNoteMutation = gql`
  mutation CreateNote($title: String!, $textContent: String!) {
    createNote(title: $title, textContent: $textContent) {
      id
      title
      textContent
    }
  }
`;

export default function NotesForm(props: Props) {
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  const [createNote] = useMutation(createNoteMutation, {
    variables: {
      title,
      textContent,
    },

    onError: (apolloError) => {
      setErrorMessage(apolloError.message);
    },

    onCompleted: () => {
      setTitle('');
      setTextContent('');
      setErrorMessage('');
      router.refresh();
    },
  });

  return (
    <>
      <h1>Notes for {props.username}</h1>
      <div className={styles.notes}>
        <div>
          {props.notes.length === 0 ? (
            'No notes yet'
          ) : (
            <ul>
              {props.notes.map((note) => (
                <li key={`note-${note.id}`}>
                  <Link href={`/notes/${note.id}`}>{note.title}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.notesForm}>
          <div>
            <h2>Create Note</h2>

            <form
              onSubmit={async (event) => {
                event.preventDefault();
                await createNote();
              }}
            >
              <label>
                Title:
                <input
                  value={title}
                  onChange={(event) => setTitle(event.currentTarget.value)}
                />
              </label>

              <label>
                Note:
                <input
                  value={textContent}
                  onChange={(event) =>
                    setTextContent(event.currentTarget.value)
                  }
                />
              </label>

              <button>Add Note</button>
            </form>

            <ErrorMessage>{errorMessage}</ErrorMessage>
          </div>
        </div>
      </div>
    </>
  );
}
