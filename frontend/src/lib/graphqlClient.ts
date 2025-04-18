import { GraphQLClient } from 'graphql-request';

const endpoint = 'https://api.goldsky.com/api/public/project_cm90kfosdtnfs01xc3bzeholh/subgraphs/Marketplace/1.0.0/gn';

export const graphQLClient = new GraphQLClient(endpoint);