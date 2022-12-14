import { Idl, web3 } from "@project-serum/anchor";
import type {
  PromiseOrValue,
  TransactionLike,
  TransactionReceipt,
} from "@saberhq/solana-contrib";
import { confirmTransactionLike } from "@saberhq/solana-contrib";
import { assert, expect } from "chai";
import * as splToken from "@solana/spl-token";
import {
  CreateMasterEditionV3,
  CreateMetadataV2,
  Creator,
  DataV2,
  MasterEdition,
  Metadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { BN } from "bn.js";

/**
 * Processes a transaction, expecting rejection or fulfillment.
 *
 * @param tx
 * @param msg
 * @param cb
 * @returns
 */
export const expectTX = (
  tx: PromiseOrValue<TransactionLike | null>,
  msg?: string,
  cb?: (receipt: TransactionReceipt) => Promise<void>
) => {
  const handleReceipt = async (receipt: TransactionReceipt) => {
    await cb?.(receipt);
    return receipt;
  };

  if (tx && "then" in tx) {
    return expect(
      tx
        .then(async (v) => {
          if (v === null) {
            throw new Error("transaction is null");
          }
          return await confirmTransactionLike(v);
        })
        .then(handleReceipt),
      msg
    );
  } else if (tx) {
    return expect(confirmTransactionLike(tx).then(handleReceipt), msg);
  } else {
    return expect(Promise.reject(new Error("transaction is null")), msg);
  }
};

export type IDLError = NonNullable<Idl["errors"]>[number];

export const assertError = (error: IDLError, other: IDLError): void => {
  assert.strictEqual(error.code, other.code);
  assert.strictEqual(error.msg, other.msg);
};

/**
 * Pay and create mint and token account
 * @param connection
 * @param creator
 * @returns
 */
export const createMint = async (
  connection: web3.Connection,
  creator: web3.Keypair,
  recipient: web3.PublicKey,
  amount = 1,
  freezeAuthority: web3.PublicKey = recipient,
  mintAuthority: web3.PublicKey = creator.publicKey,
  decimals?: number
): Promise<[web3.PublicKey, splToken.Token]> => {
  const fromAirdropSignature = await connection.requestAirdrop(
    creator.publicKey,
    web3.LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(fromAirdropSignature);
  const mint = await splToken.Token.createMint(
    connection,
    creator,
    mintAuthority,
    freezeAuthority,
    decimals ?? 0,
    splToken.TOKEN_PROGRAM_ID
  );
  const tokenAccount = await mint.createAssociatedTokenAccount(recipient);
  if (amount) {
    await mint.mintTo(tokenAccount, creator.publicKey, [], amount);
  }
  return [tokenAccount, mint];
};

/**
 * Create instructions for master edition
 * @param mintId
 * @param tokenCreatorId
 */
export const createMasterEditionIxs = async (
  mintId: web3.PublicKey,
  tokenCreatorId: web3.PublicKey
) => {
  const metadataId = await Metadata.getPDA(mintId);
  const metadataTx = new CreateMetadataV2(
    { feePayer: tokenCreatorId },
    {
      metadata: metadataId,
      metadataData: new DataV2({
        name: "test",
        symbol: "TST",
        sellerFeeBasisPoints: 10,
        uri: "https://test/",
        creators: [
          new Creator({
            address: tokenCreatorId.toBase58(),
            verified: true,
            share: 100,
          }),
        ],
        collection: null,
        uses: null,
      }),
      updateAuthority: tokenCreatorId,
      mint: mintId,
      mintAuthority: tokenCreatorId,
    }
  );

  const masterEditionId = await MasterEdition.getPDA(mintId);
  const masterEditionTx = new CreateMasterEditionV3(
    { feePayer: tokenCreatorId },
    {
      edition: masterEditionId,
      metadata: metadataId,
      updateAuthority: tokenCreatorId,
      mint: mintId,
      mintAuthority: tokenCreatorId,
      maxSupply: new BN(1),
    }
  );
  return [...metadataTx.instructions, ...masterEditionTx.instructions];
};
