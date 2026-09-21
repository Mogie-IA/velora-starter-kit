use anchor_lang::prelude::*;

#[error_code]
pub enum EscrowError {
    #[msg("Fee rate cannot exceed 10% (1000 bps)")]
    FeeTooHigh,
    #[msg("Project is not active")]
    ProjectNotActive,
    #[msg("Milestone index is outside this project's range")]
    MilestoneIndexOutOfRange,
    #[msg("Milestone amount must be greater than zero")]
    ZeroAmount,
    #[msg("Milestone must be funded before work can be submitted")]
    MilestoneNotFunded,
    #[msg("Milestone must be submitted before it can be approved")]
    MilestoneNotSubmitted,
    #[msg("Milestone has already been funded")]
    MilestoneAlreadyFunded,
    #[msg("Milestone has already been released or refunded")]
    MilestoneClosed,
    #[msg("Only the assigned inspector or the client may approve a milestone")]
    NotAnApprover,
    #[msg("This party has already approved the milestone")]
    AlreadyApproved,
    #[msg("Funds can only be refunded before the contractor submits work")]
    RefundNotAllowed,
    #[msg("Evidence URI exceeds the maximum length")]
    EvidenceUriTooLong,
    #[msg("Arithmetic overflow")]
    MathOverflow,
    #[msg("Token account owner does not match the expected party")]
    TokenAccountOwnerMismatch,
    #[msg("Token account mint does not match the project mint")]
    MintMismatch,
}
