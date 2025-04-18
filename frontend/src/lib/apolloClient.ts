import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.goldsky.com/api/public/project_cm90kfosdtnfs01xc3bzeholh/subgraphs/Marketplace/1.0.0/gn',
  cache: new InMemoryCache(),
});

export default client;