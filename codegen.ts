import type { CodegenConfig } from '@graphql-codegen/cli';

const codegenConfig: CodegenConfig = {
  overwrite: true,
  schema: './app/api/graphql/route.ts',
  generates: {
    './graphql/graphqlGeneratedTypes.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
    },
  },

  config: {
    useTypeImports: true,
  },
};

export default codegenConfig;
