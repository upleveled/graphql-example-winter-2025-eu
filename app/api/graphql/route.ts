import crypto from 'node:crypto';
import { gql } from '@apollo/client';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { makeExecutableSchema } from '@graphql-tools/schema';
import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import {
  createAnimalInsecure,
  deleteAnimalInsecure,
  getAnimalInsecure,
  getAnimalsInsecure,
  updateAnimalInsecure,
} from '../../../database/animals';
import { createSessionInsecure } from '../../../database/sessions';
import { createUserInsecure, getUserInsecure } from '../../../database/users';
import type { Resolvers } from '../../../graphql/graphqlGeneratedTypes';
import type { Animal } from '../../../migrations/00000-createTableAnimals';
import { userSchema } from '../../../migrations/00002-createTableUsers';
import { secureCookieOptions } from '../../../util/cookies';

export type GraphqlResponseBody =
  | {
      animal: Animal;
    }
  | Error;

const typeDefs = gql`
  type Animal {
    id: ID!
    firstName: String!
    type: String!
    accessory: String
  }

  type User {
    id: ID!
    username: String!
  }

  type Query {
    animals: [Animal]
    animal(id: ID!): Animal
  }

  type Mutation {
    createAnimal(firstName: String!, type: String!, accessory: String): Animal

    deleteAnimal(id: ID!): Animal

    updateAnimal(
      id: ID!
      firstName: String!
      type: String!
      accessory: String
    ): Animal

    register(username: String!, password: String!): User
  }
`;

const resolvers: Resolvers = {
  Query: {
    animals: async () => {
      return await getAnimalsInsecure();
    },

    animal: async (parent, args) => {
      return await getAnimalInsecure(Number(args.id));
    },
  },

  Mutation: {
    createAnimal: async (parent, args) => {
      if (
        typeof args.firstName !== 'string' ||
        typeof args.type !== 'string' ||
        (args.accessory && typeof args.type !== 'string') ||
        !args.firstName ||
        !args.type
      ) {
        throw new GraphQLError('Required field missing');
      }

      return await createAnimalInsecure({
        type: args.type,
        firstName: args.firstName,
        accessory: args.accessory || null,
      });
    },

    updateAnimal: async (parent, args) => {
      if (
        typeof args.firstName !== 'string' ||
        typeof args.type !== 'string' ||
        (args.accessory && typeof args.type !== 'string') ||
        !args.firstName ||
        !args.type
      ) {
        throw new Error('Required field missing');
      }

      return await updateAnimalInsecure({
        id: Number(args.id),
        type: args.type,
        firstName: args.firstName,
        accessory: args.accessory || null,
      });
    },

    deleteAnimal: async (parent, args) => {
      return await deleteAnimalInsecure(Number(args.id));
    },

    register: async (parent, args) => {
      // 1. Validate the user data with zod
      const result = userSchema.safeParse(args);

      if (!result.success) {
        throw new GraphQLError('Required field missing');
      }

      // 2. Check if user already exist in the database
      const user = await getUserInsecure(result.data.username);

      if (user) {
        throw new GraphQLError('Username already taken');
      }

      // 3. Hash the plain password from the user
      const passwordHash = await bcrypt.hash(result.data.password, 12);

      // 4. Save the user information with the hashed password in the database
      const newUser = await createUserInsecure(
        result.data.username,
        passwordHash,
      );

      if (!newUser) {
        throw new GraphQLError('Registration failed');
      }

      // 5. Create a token
      const token = crypto.randomBytes(100).toString('base64');

      // 6. Create the session record
      const session = await createSessionInsecure(token, Number(newUser.id));

      if (!session) {
        throw new GraphQLError('Sessions creation failed');
      }

      // 7. Send the new cookie in the headers
      (await cookies()).set({
        name: 'sessionToken',
        value: session.token,
        ...secureCookieOptions,
      });

      // 8. Return the new user information
      return newUser;
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const apolloServer = new ApolloServer({ schema });

const apolloServerRouteHandler = startServerAndCreateNextHandler(apolloServer);

// export async function GET(req: NextRequest) {
//   return await apolloServerRouteHandler(req);
// }

// export async function POST(req: NextRequest) {
//   return await apolloServerRouteHandler(req);
// }

export async function GET(
  req: NextRequest,
): Promise<NextResponse<GraphqlResponseBody>> {
  return (await apolloServerRouteHandler(
    req,
  )) as NextResponse<GraphqlResponseBody>;
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<GraphqlResponseBody>> {
  return (await apolloServerRouteHandler(
    req,
  )) as NextResponse<GraphqlResponseBody>;
}
