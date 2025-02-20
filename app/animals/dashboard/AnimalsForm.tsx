'use client';

import { gql, useMutation, useSuspenseQuery } from '@apollo/client';
import { useState } from 'react';
import type { Animal } from '../../../migrations/00000-createTableAnimals';
import ErrorMessage from '../../ErrorMessage';
import styles from './AnimalsForm.module.scss';

const animals = gql`
  query Animals {
    animals {
      id
      firstName
      type
      accessory
    }
  }
`;

const createAnimalMutation = gql`
  mutation CreateAnimal(
    $firstName: String!
    $type: String!
    $accessory: String
  ) {
    createAnimal(firstName: $firstName, type: $type, accessory: $accessory) {
      id
      firstName
      type
      accessory
    }
  }
`;

const updateAnimalMutation = gql`
  mutation UpdateAnimal(
    $id: ID!
    $firstName: String!
    $type: String!
    $accessory: String
  ) {
    updateAnimal(
      id: $id
      firstName: $firstName
      type: $type
      accessory: $accessory
    ) {
      id
      firstName
      type
      accessory
    }
  }
`;

const deleteAnimalMutation = gql`
  mutation DeleteAnimal($id: ID!) {
    deleteAnimal(id: $id) {
      id
    }
  }
`;

export default function AnimalsForm() {
  const [errorMessage, setErrorMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [type, setType] = useState('');
  const [accessory, setAccessory] = useState('');
  const [id, setId] = useState(0);

  const { data } = useSuspenseQuery<{ animals: Animal[] }>(animals);

  function resetFormStates() {
    setId(0);
    setFirstName('');
    setType('');
    setAccessory('');
  }

  const [createAnimal] = useMutation(createAnimalMutation, {
    variables: {
      firstName,
      type,
      accessory,
    },

    onError: (apolloError) => {
      setErrorMessage(apolloError.message);
    },

    onCompleted: () => {
      resetFormStates();
      setErrorMessage('');
    },

    refetchQueries: ['Animals'],
  });

  const [updateAnimal] = useMutation(updateAnimalMutation, {
    variables: {
      id,
      firstName,
      type,
      accessory,
    },

    onError: (apolloError) => {
      setErrorMessage(apolloError.message);
    },

    onCompleted: () => {
      resetFormStates();
      setErrorMessage('');
    },

    refetchQueries: ['Animals'],
  });

  const [deleteAnimal] = useMutation(deleteAnimalMutation, {
    onError: (apolloError) => {
      setErrorMessage(apolloError.message);
    },

    onCompleted: () => {
      setErrorMessage('');
    },

    refetchQueries: ['Animals'],
  });

  return (
    <>
      <h1>Animal Dashboard</h1>

      <div className={styles.dashboard}>
        <div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Accessory</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.animals.map((animal) => (
                <tr
                  key={`animal-${animal.id}`}
                  className={id === animal.id ? styles.selectedItem : ''}
                >
                  <td>{animal.firstName}</td>
                  <td>{animal.type}</td>
                  <td>{animal.accessory}</td>
                  <td className={styles.buttonCell}>
                    <button
                      disabled={id === animal.id}
                      onClick={() => {
                        setId(animal.id);
                        setFirstName(animal.firstName);
                        setType(animal.type);
                        setAccessory(animal.accessory || '');
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await deleteAnimal({
                          variables: {
                            id: animal.id,
                          },
                        });
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.animalForm}>
          <h2>{id ? 'Edit Animal' : 'Add Animal'}</h2>

          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (id) {
                await updateAnimal();
              } else {
                await createAnimal();
              }
            }}
          >
            <label>
              First Name
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.currentTarget.value)}
              />
            </label>

            <label>
              Type
              <input
                value={type}
                onChange={(event) => setType(event.currentTarget.value)}
              />
            </label>

            <label>
              Accessory
              <input
                value={accessory}
                onChange={(event) => setAccessory(event.currentTarget.value)}
              />
            </label>

            <button>{id ? 'Save Changes' : 'Add Animal'}</button>
          </form>
          <ErrorMessage>{errorMessage}</ErrorMessage>
        </div>
      </div>
    </>
  );
}
