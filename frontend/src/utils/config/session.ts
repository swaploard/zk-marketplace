/**
 * Iron Session configuration and helpers.
 *
 * This file exports the configuration options for Iron Session, as well as two
 * helper functions: `getSession` and `getServerActionSession`.
 *
 * The `getSession` function returns an instance of `IronSessionData` for the
 * current request and response.
 *
 * The `getServerActionSession` function returns an instance of `IronSessionData`
 * for the current request and response, but is specifically designed to be used
 * with Next.js server actions.
 *
 * The `IronSessionData` interface is augmented to include a `nonce` property, which
 * is used to store a nonce value in the session. This is used by the
 * `siwe-next` package to store a nonce value in the session.
 *
 * 
 */
import {
  IronSessionOptions,
  getIronSession,
  IronSessionData,
  getServerActionIronSession,
} from "iron-session";

import { cookies } from "next/headers";

export const sessionOptions: IronSessionOptions = {
  /**
   * The password to use for encrypting the session data.
   *
   * **This should be changed to a secure password in production!**
   */
  password: "change-this-this-is-not-a-secure-password",
  /**
   * The name of the cookie to store the session data in.
   */
  cookieName: "cookieNameInBrowser",
  /**
   * Options for the cookie.
   */
  cookieOptions: {
    /**
     * Whether to set the `Secure` flag on the cookie.
     *
     * This is set to `true` in production, but `false` in development.
     */
    secure: process.env.NODE_ENV === "production",
  },
};

declare module "iron-session" {
  /**
   * The shape of the session data.
   */
  interface IronSessionData {
    /**
     * A nonce value stored in the session.
     */
    nonce?: string;
  }
}

/**
 * Returns an instance of `IronSessionData` for the current request and response.
 *
 * @param req - The current request.
 * @param res - The current response.
 */
const getSession = async (req: Request, res: Response) => {
  const session = getIronSession<IronSessionData>(req, res, sessionOptions);
  return session;
};

/**
 * Returns an instance of `IronSessionData` for the current request and response,
 * but is specifically designed to be used with Next.js server actions.
 */
const getServerActionSession = async () => {
  const session = await getServerActionIronSession<IronSessionData>(
    sessionOptions,
    await cookies()
  );
  return session;
};

export { getSession, getServerActionSession };

