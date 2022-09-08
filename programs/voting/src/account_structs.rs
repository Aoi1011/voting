use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct Initialize<'info> {
    #[account(
        init,
        seeds = [
            b"my_khe_governor".as_ref(), 
        ],
        bump,
        payer = payer,
        space = 8 + PollCount::LEN
    )]
    pub count_data: Account<'info, PollCount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreatePoll<'info> {
    #[account(
        mut,
        seeds = [
            b"my_khe_governor".as_ref(), 
        ],
        bump,
    )]
    pub count_data: Account<'info, PollCount>,
    #[account(
        init,
        seeds = [
            b"my_khe_proposal".as_ref(),
            count_data.proposal_count.to_le_bytes().as_ref()
        ],
        bump,
        payer = payer, 
        space = Poll::LEN
    )]
    pub poll: Account<'info, Poll>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(voter: Pubkey)]
pub struct VotePoll<'info> {
    pub poll: Account<'info, Poll>,
    #[account(
        init, 
        seeds = [
            b"my_khe_vote".as_ref(),
            poll.key().as_ref(),
            voter.as_ref()
        ],
        bump,
        payer = payer,
        space = Vote::LEN
    )]
    pub vote: Account<'info, Vote>, 
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
