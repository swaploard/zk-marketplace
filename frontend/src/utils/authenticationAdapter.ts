/**
 * Authentication adapter for RainbowKit.
 *
 * This adapter uses the `next-auth` library to handle authentication.
 * It uses the `signIn` and `signOut` functions from `next-auth/react` to handle
 * the authentication flow.
 *
 * The adapter also uses the `createSiweMessage` function from `viem/siwe` to
 * create a SIWE message for the user to sign.
 */
import { createAuthenticationAdapter } from "@rainbow-me/rainbowkit";
import { createSiweMessage } from "viem/siwe";
import { signIn, signOut } from "next-auth/react";

export const authenticationAdapter = createAuthenticationAdapter({
  /**
   * Get a nonce from the server.
   *
   * This function fetches a nonce from the server using the `/api/nonce` endpoint.
   * The nonce is used to create a SIWE message for the user to sign.
   *
   * @returns {Promise<string>} The nonce fetched from the server.
   */
  getNonce: async () => {
    const verifyRes = await fetch("/api/nonce", {
      method: "POST", // Changed to POST
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}), // Include an empty body or any required data
    });

    if (!verifyRes.ok) {
      throw new Error("Failed to fetch nonce");
    }

    const data = await verifyRes.json(); // Convert response to JSON
    return data.nonce; // Return the fetched nonce
  },

  /**
   * Create a SIWE message for the user to sign.
   *
   * This function creates a SIWE message using the `createSiweMessage` function
   * from `viem/siwe`.
   *
   * @param {{ nonce: string; address: string; chainId: number }} params
   * @returns {string} The SIWE message to sign.
   */
  createMessage: ({ nonce, address, chainId }) => {
    return createSiweMessage({
      domain: window.location.host,
      address,
      statement: "Sign in with Ethereum to the app.",
      uri: window.location.origin,
      version: "1",
      chainId,
      nonce,
    });
  },

  /**
   * Verify the user's signature.
   *
   * This function verifies the user's signature using the `signIn` function from
   * `next-auth/react`.
   *
   * @param {{ message: string; signature: string }} params
   * @returns {Promise<boolean>} Whether the signature is valid or not.
   */
  verify: async ({ message, signature }) => {
    const loginData = { message, signature };
    const verifyRes = await signIn("credentials", {
      redirect: false,
      ...loginData,
    });
    return Boolean(verifyRes?.ok);
  },

  /**
   * Sign out the user.
   *
   * This function signs out the user using the `signOut` function from
   * `next-auth/react`.
   *
   * @returns {Promise<void>}
   */
  signOut: async () => {
    await signOut();
  },
});
