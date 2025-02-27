import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getNotes } from '../../database/notes';
import { getUser } from '../../database/users';
import NotesForm from './NotesForm';

export default async function NotesPage() {
  // Task: Restrict access to the notes page and only display notes belonging to the current logged in user

  // 1. Checking if the sessionToken cookie exists
  const sessionTokenCookie = (await cookies()).get('sessionToken');

  // 2. Query user with the sessionToken
  const user = sessionTokenCookie && (await getUser(sessionTokenCookie.value));

  if (!user) redirect('/login?returnTo=/notes');

  // 3. Display the notes for the current logged in user
  const notes = await getNotes(sessionTokenCookie.value);

  return <NotesForm notes={notes} username={user.username} />;
}
