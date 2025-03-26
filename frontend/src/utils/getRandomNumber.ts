import { randomBytes } from "crypto";

function getRandomUint256() {
  return "0x" + randomBytes(32).toString("hex");
}

export default getRandomUint256;