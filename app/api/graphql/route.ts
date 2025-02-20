import { gql } from '@apollo/client';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLError } from 'graphql';
import type { NextRequest, NextResponse } from 'next/server';
import {
  createAnimalInsecure,
  deleteAnimalInsecure,
  getAnimalInsecure,
  getAnimalsInsecure,
  updateAnimalInsecure,
} from '../../../database/animals';
import type { Resolvers } from '../../../graphql/graphqlGeneratedTypes';
import type { Animal } from '../../../migrations/00000-createTableAnimals';

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
