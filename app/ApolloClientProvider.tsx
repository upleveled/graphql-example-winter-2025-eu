// 'use client';
// // ^ this file needs the "use client" pragma

// import { HttpLink } from '@apollo/client';
// import {
//   ApolloClient,
//   ApolloNextAppProvider,
//   InMemoryCache,
// } from '@apollo/experimental-nextjs-app-support';

// // have a function to create a client for you
// function makeClient() {
//   const httpLink = new HttpLink({
//     // this needs to be an absolute url, as relative urls cannot be used in SSR
//     uri: 'http://localhost:3000/api/graphql',
//     // you can disable result caching here if you want to
//     // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
//     fetchOptions: { cache: 'no-store' },
//     // you can override the default `fetchOptions` on a per query basis
//     // via the `context` property on the options passed as a second argument
//     // to an Apollo Client data fetching hook, e.g.:
//     // const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { cache: "force-cache" }}});
//   });

//   // use the `ApolloClient` from "@apollo/experimental-nextjs-app-support"
//   return new ApolloClient({
//     // use the `InMemoryCache` from "@apollo/experimental-nextjs-app-support"
//     cache: new InMemoryCache(),
//     link: httpLink,
//   });
// }

// // you need to create a component to wrap your app in
// export function ApolloClientProvider({ children }: React.PropsWithChildren) {
//   return (
//     <ApolloNextAppProvider makeClient={makeClient}>
//       {children}
//     </ApolloNextAppProvider>
//   );
// }

'use client';

import { ApolloLink, HttpLink } from '@apollo/client';
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support';

function makeClient() {
  const httpLink = new HttpLink({
    uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/graphql`,
    fetchOptions: { cache: 'no-store' },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link:
      typeof window === 'undefined'
        ? ApolloLink.from([
            new SSRMultipartLink({
              stripDefer: true,
            }),
            httpLink,
          ])
        : httpLink,
  });
}

export function ApolloClientProvider({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
