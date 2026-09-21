use anchor_lang::prelude::*;

/// Global protocol configuration. Fee rates live here so they can be tuned
/// without redeploying the program.
///
/// Note what this account deliberately does NOT allow: the `authority` can
/// change fee rates, but has no instruction anywhere in this program that lets
/// it move escrowed funds. Escrow can only ever move via `approve_milestone`
/// (requiring both the inspector and the client) or `refund_milestone`
/// (returning funds to the client). That is the core trust guarantee.
#[account]
#[derive(InitSpace)]
pub struct Config {
    /// Admin allowed to update fee rates and rotate the treasury.
    pub authority: Pubkey,
    /// Destination for all protocol fees.
    pub treasury: Pubkey,
    /// Charged to the client on top of what they fund. 300 = 3.00%.
    pub client_fee_bps: u16,
    /// Deducted from the contractor's payout at release. 100 = 1.00%.
    pub contractor_fee_bps: u16,
    /// Deducted from the inspector's payout at release. 100 = 1.00%.
    pub inspector_fee_bps: u16,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum ProjectStatus {
    Active,
    Completed,
    Cancelled,
}

/// One construction job between a client, a contractor and an inspector.
#[account]
#[derive(InitSpace)]
pub struct Project {
    /// Diaspora payer funding the build.
    pub client: Pubkey,
    /// Builder receiving milestone payouts.
    pub contractor: Pubkey,
    /// Independent surveyor who verifies work on site.
    pub inspector: Pubkey,
    /// SPL mint used for the whole project (USDC in production).
    pub mint: Pubkey,
    /// Client-scoped nonce, lets one client run many projects.
    pub project_id: u64,
    /// How many milestones this project was created with.
    pub milestone_count: u8,
    /// How many have fully paid out.
    pub milestones_released: u8,
    /// Sum currently sitting in the vault across all funded milestones.
    pub total_escrowed: u64,
    pub status: ProjectStatus,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum MilestoneStatus {
    /// Defined, but the client has not put money behind it yet.
    Pending,
    /// Client has funded it. Work can begin.
    Funded,
    /// Contractor says the work is done and has attached evidence.
    Submitted,
    /// Both approvals collected and funds have moved. Terminal.
    Released,
    /// Client pulled funding back before work was submitted. Terminal.
    Refunded,
}

/// A single stage of work (foundation, roofing, ...) and the money behind it.
#[account]
#[derive(InitSpace)]
pub struct Milestone {
    pub project: Pubkey,
    pub index: u8,
    /// Gross amount owed to the contractor, before the contractor fee.
    pub amount: u64,
    /// Gross amount owed to the inspector, before the inspector fee.
    pub inspection_fee: u64,
    pub status: MilestoneStatus,
    /// Set by the inspector after a site visit.
    pub inspector_approved: bool,
    /// Set by the client after reviewing the evidence.
    pub client_approved: bool,
    /// Where the contractor's photo/video proof lives.
    #[max_len(200)]
    pub evidence_uri: String,
    pub bump: u8,
}

impl Milestone {
    /// What the client must transfer to fund this milestone, fee included.
    pub fn funding_total(&self, client_fee_bps: u16) -> Option<(u64, u64)> {
        let escrowed = self.amount.checked_add(self.inspection_fee)?;
        let fee = fee_of(escrowed, client_fee_bps)?;
        Some((escrowed, fee))
    }
}

/// Basis-point fee, rounded down. 10_000 bps = 100%.
pub fn fee_of(amount: u64, bps: u16) -> Option<u64> {
    amount
        .checked_mul(bps as u64)?
        .checked_div(10_000)
}
