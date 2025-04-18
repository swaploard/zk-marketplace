import { gql } from "graphql-request";

export const auctionsQuery = gql`
  query MyQuery {
    auctionCreateds {
      auctionId
    }
  }
`;
