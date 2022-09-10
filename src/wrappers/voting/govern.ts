import { TransactionEnvelope } from "@saberhq/solana-contrib";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";

import { VoteData, VotingProgram } from "../../programs";
import { MyKheSDK } from "../../sdk";
import { findGovernorAddress } from "./pda";
import { PendingGovernor } from "./types";
import { VotingWrapper } from "./voting";

export class GovernWrapper {
  readonly program: VotingProgram;

  constructor(readonly sdk: MyKheSDK) {
    this.program = sdk.program.Voting;
  }

  get provider() {
    return this.sdk.provider;
  }

  async fetchVote(key: PublicKey): Promise<VoteData> {
    return await this.program.account.voteData.fetch(key);
  }

  async createGovernor({
    baseKP = Keypair.generate(),
  }: {
    baseKP: Keypair;
  }): Promise<PendingGovernor> {
    const [countData, bump] = await findGovernorAddress();
    const wrapper = new VotingWrapper(this.sdk, countData);

    return {
      wrapper,
      tx: new TransactionEnvelope(
        this.provider,
        [
          this.sdk.program.Voting.instruction.initialize(bump, {
            accounts: {
              countData: countData,
              payer: this.provider.wallet.publicKey,
              systemProgram: SystemProgram.programId,
            },
          }),
        ],
        [baseKP]
      ),
    };
  }
}
