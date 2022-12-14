use anchor_lang::{prelude::*, solana_program::pubkey::PUBKEY_BYTES};

#[account]
pub struct PollCount {
    /// The total number of proposal
    pub proposal_count: u64,
    /// Bump
    pub bump: u8,
}

impl PollCount {
    pub const LEN: usize = 8 + 1 + 1;
    pub const VOTING_PERIOD: u64 = 604800; // 1 week
}

#[account]
#[derive(Debug, Default)]
pub struct Poll {
    /// The unique ID of the poll, auto-incremented
    pub index: u64,
    /// Bump seed
    pub bump: u8,

    /// The public key of proposer
    pub proposer: Pubkey,

    /// Current number of votes in favor of this proposal
    pub for_votes: u64,
    /// Current number of votes in opposition to this proposal
    pub against_votes: u64,

    /// The timestamp when the poll was canceled
    pub canceled_at: i64,
    /// The timestamp when the proposal was created
    pub created_at: i64,
    /// The timestamp in which the poll was activated
    /// This is when voting begins
    pub activated_at: i64,
    /// The timestamp when voting ends
    /// This only applies to activate proposal
    pub voting_ends_at: i64,
}

impl Poll {
    pub const LEN: usize = 8 + 8 + 1 + PUBKEY_BYTES + 8 + 8 + 8 + 8 + 8 + 8;
}

#[account]
#[derive(Debug, Default)]
pub struct PollMeta {
    /// The [Poll]
    pub poll: Pubkey,
    /// Title of the poll
    pub title: String,
    /// Link to a description of the poll
    pub description_link: String,
}

impl PollMeta {
    pub const LEN: usize = 8 + PUBKEY_BYTES;
}

#[account]
pub struct Vote {
    ///  The poll being voted on
    pub poll: Pubkey,
    /// The voter
    pub voter: Pubkey,
    /// The side of the vote taken
    pub option_selected: u8,
    /// Bump seed
    pub bump: u8,
}

impl Vote {
    pub const LEN: usize = 8 + PUBKEY_BYTES + PUBKEY_BYTES + 1 + 1;
}
