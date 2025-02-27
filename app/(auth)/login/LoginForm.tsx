'use client';

import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getSafeReturnToPath } from '../../../util/validation';
import ErrorMessage from '../../ErrorMessage';

const loginMutation = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      username
    }
  }
`;

type Props = {
  returnTo?: string | string[];
};

export default function LoginForm(props: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const [login] = useMutation(loginMutation, {
    variables: {
      username,
      password,
    },

    onError: (apolloError) => {
      setError(apolloError.message);
    },

    onCompleted: () => {
      router.push(getSafeReturnToPath(props.returnTo) || '/');
      router.refresh();
    },
  });

  return (
    <>
      <h1>Login</h1>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          await login();
        }}
      >
        <label>
          username
          <input
            value={username}
            onChange={(event) => {
              setUsername(event.currentTarget.value);
            }}
          />
        </label>
        <br />
        <label>
          password
          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.currentTarget.value);
            }}
          />
        </label>
        <button>Login</button>
      </form>
      <ErrorMessage>{error}</ErrorMessage>
    </>
  );
}
