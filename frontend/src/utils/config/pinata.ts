import { PinataSDK } from "pinata-web3";

export const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_JWT_PINATA,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL_PINATA,
});
