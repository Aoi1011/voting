import * as anchor from "@project-serum/anchor";
import {
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { expect } from "chai";
import invariant from "tiny-invariant";
import { SolanaProvider, TransactionEnvelope } from "@saberhq/solana-contrib";
import { expectTXTable } from "@saberhq/chai-solana";

import { getProvider, ONE, ZERO } from "./workspace";
import { findPollAddress, findPollCountAddress } from "../src";
import {
  withCreateProposal,
  withCreateProposalMeta,
  withInitPoolCount,
} from "../src/programs/voting/transaction";
import {
  fetchPoleCount,
  fetchPoll,
  fetchPollMeta,
} from "../src/programs/voting/accounts";

describe("Voting", () => {
  let countDataPda: PublicKey;

  before(async () => {
    const provider = getProvider();
    const transaction = new anchor.web3.Transaction();

    [, countDataPda] = await withInitPoolCount(
      transaction,
      provider.connection,
      provider.wallet
    );

    await provider.sendAndConfirm(transaction);
  });

  it("PollCounter (Governor) was initialized", async () => {
    const provider = getProvider();
    const pollCountData = await fetchPoleCount(
      provider.connection,
      countDataPda
    );
    const [pollCount, bump] = await findPollCountAddress();

    invariant(pollCountData, "pollcounter data was not loaded");

    expect(pollCountData.bump).to.equal(bump);
    expect(pollCountData.proposalCount.toString()).to.equal(ZERO.toString());

    countDataPda = pollCount;
  });

  describe("Proposal", () => {
    let pollIndex: anchor.BN;
    let pollDataPda: PublicKey;
    let pollMetaDataPda: PublicKey;

    before("Create a dummy poll and metadata", async () => {
      // Create Proposal
      const provider = getProvider();
      const transaction = new anchor.web3.Transaction();

      [, pollDataPda, pollIndex] = await withCreateProposal(
        transaction,
        provider.connection,
        provider.wallet
      );

      // Create Proposal Metadata
      [, pollMetaDataPda] = await withCreateProposalMeta(
        transaction,
        provider.connection,
        provider.wallet,
        { index: pollIndex }
      );

      await provider.sendAndConfirm(transaction);
    });

    it("Dummy poll created", async () => {
      const provider = getProvider();
      const [expectedPollKey, bump] = await findPollAddress(pollIndex);
      expect(pollDataPda.toString()).to.equal(expectedPollKey.toString());

      const pollData = await fetchPoll(provider.connection, pollDataPda);
      expect(pollData.bump).to.equal(bump);
      expect(pollData.index.toString()).to.equal(pollIndex.toString());
      expect(pollData.proposer.toString()).to.equal(
        provider.wallet.publicKey.toString()
      );
    });

    it("Dummy pollMeta as created", async () => {
      const provider = getProvider();

      const pollMetaData = await fetchPollMeta(
        provider.connection,
        pollMetaDataPda
      );
      expect(pollMetaData.title).to.equal("Dummy proposal");
      expect(pollMetaData.descriptionLink).to.equal(
        "https://www.my_khe_project.com/"
      );
    });

    // it("Vote", async () => {
    //   const { payer, bump, votePdaKey } = await votingW.votePoll(pollKey);

    //   await votingW.program.methods
    //     .votePoll(bump, payer, ONE)
    //     .accounts({
    //       poll: pollKey,
    //       vote: votePdaKey,
    //       payer: votingW.provider.wallet.publicKey,
    //       systemProgram: anchor.web3.SystemProgram.programId,
    //     })
    //     .rpc();

    //   const voteData = await votingW.fetchVote(votePdaKey);

    //   expect(voteData.bump).to.equal(bump);
    //   expect(voteData.optionSelected.toString()).to.equal(ONE.toString());
    //   expect(voteData.poll.toString()).to.equal(pollKey.toString());
    //   expect(voteData.voter.toString()).to.equal(payer.toString());
    // });
  });
});
