use crate::*;

// #[event]
// pub struct PollCounterCreaterEvent {
//     #[index]
//     pub
// }
#[event]
pub struct PollCreateEvent {
    /// The poll being created
    #[index]
    pub poll: Pubkey,
    /// The index of the [Proposal]
    pub index: u64,
}