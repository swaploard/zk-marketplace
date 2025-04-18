const ethers = require("ethers");

const sepoliaProviderUrl = process.env.NEXT_PUBLIC_SEPOLIA_HTTP_RPC;

const SEPOLIA_NETWORK = {
  name: "sepolia",
  chainId: 11155111,
  _defaultProvider: (providers) => new providers.JsonRpcProvider(sepoliaProviderUrl),
};


const sepoliaProvider = ethers.getDefaultProvider(SEPOLIA_NETWORK);
const sepoliaSigner = new ethers.Wallet(process.env.RELAYER_PK!, sepoliaProvider);

export { sepoliaSigner, sepoliaProvider };
