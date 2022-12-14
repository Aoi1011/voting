import { PublicKey } from "@solana/web3.js";

import * as STAKE_POOL_TYPES from "../../idl/locked_voter";

export const LOCKED_VOTING_ADDRESS = new PublicKey(
  "G8BgM1hwZjPWv8jkJhwpj1WKVneuUUuK9QKXDJxJtX2u"
);

export type STAKE_POOL_PROGRAM = STAKE_POOL_TYPES.LockedVoter;
export const STAKE_POOL_IDL = STAKE_POOL_TYPES.IDL;
