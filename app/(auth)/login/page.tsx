import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import { getValidSession } from '../../../database/sessions';
import LoginForm from './LoginForm';

type Props = {
  searchParams: Promise<{
    returnTo?: string | string[];
  }>;
};

export default async function LoginPage(props: Props) {
  // Task: Add redirect to home if user is logged in
  const searchParams = await props.searchParams;

  // 1. Checking if the sessionToken cookie exists
  const sessionCookie = (await cookies()).get('sessionToken');

  // 2. Check if the sessionToken cookie is still valid
  const session = sessionCookie && (await getValidSession(sessionCookie.value));

  // 3. If the sessionToken cookie is valid, redirect to home
  if (session) {
    redirect('/');
  }

  // 4. If the sessionToken cookie is invalid or doesn't exist, show the login form
  return <LoginForm returnTo={searchParams.returnTo} />;
}
