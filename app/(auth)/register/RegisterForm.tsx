'use client';

import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ErrorMessage from '../../ErrorMessage';

const registerMutation = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password) {
      id
      username
    }
  }
`;

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  const [register] = useMutation(registerMutation, {
    variables: {
      username,
      password,
    },

    onError: (apolloError) => {
      setErrorMessage(apolloError.message);
    },

    onCompleted: () => {
      setErrorMessage('');
      router.refresh();
    },
  });

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        await register();
      }}
    >
      <label>
        username
        <input
          value={username}
          onChange={(event) => setUsername(event.currentTarget.value)}
        />
      </label>

      <label>
        password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
        />
      </label>
      <button>Register</button>

      <ErrorMessage>{errorMessage}</ErrorMessage>
    </form>
  );
}
