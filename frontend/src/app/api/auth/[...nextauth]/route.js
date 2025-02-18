import NextAuth from "next-auth";
import { authConfig } from "../../../../../auth";

export const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };
