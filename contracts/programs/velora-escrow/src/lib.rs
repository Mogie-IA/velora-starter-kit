//! # Velora Escrow
//!
//! Milestone escrow for diaspora-funded construction.
//!
//! A client funds a build stage by stage. Money sits in a vault owned by the
//! project itself, and is only ever paid out when **both** the independent
//! inspector (who visits the site) and the client sign off on that stage.
//!
//! The property that makes this worth putting on-chain: there is no
//! instruction — not for the contractor, not for the inspector, not for the
//! client alone, and not for the protocol authority — that can move escrowed
//! funds to the contractor without both approvals. The admin key can change fee
//! rates and nothing else. A centralised escrow service cannot make that
//! promise about its own database.

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

pub mod errors;
pub mod state;

use errors::EscrowError;
use state::*;

declare_id!("7bLsUwEJkbQRaJ7BzEbGhvnCQcZkaHf6K1UFndijyc9P");

/// No fee may exceed 10%.
const MAX_FEE_BPS: u16 = 1_000;
const MAX_EVIDENCE_URI_LEN: usize = 200;

#[program]
pub mod velora_escrow {
    use super::*;

    /// One-time protocol setup. Sets the treasury and the three fee rates.
    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        client_fee_bps: u16,
        contractor_fee_bps: u16,
        inspector_fee_bps: u16,
    ) -> Result<()> {
        require!(
            client_fee_bps <= MAX_FEE_BPS
                && contractor_fee_bps <= MAX_FEE_BPS
                && inspector_fee_bps <= MAX_FEE_BPS,
            EscrowError::FeeTooHigh
        );

        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.treasury = ctx.accounts.treasury.key();
        config.client_fee_bps = client_fee_bps;
        config.contractor_fee_bps = contractor_fee_bps;
        config.inspector_fee_bps = inspector_fee_bps;
        config.bump = ctx.bumps.config;

        Ok(())
    }

    /// Adjust fee rates. Deliberately cannot touch any escrowed funds.
    pub fn update_fees(
        ctx: Context<UpdateFees>,
        client_fee_bps: u16,
        contractor_fee_bps: u16,
        inspector_fee_bps: u16,
    ) -> Result<()> {
        require!(
            client_fee_bps <= MAX_FEE_BPS
                && contractor_fee_bps <= MAX_FEE_BPS
                && inspector_fee_bps <= MAX_FEE_BPS,
            EscrowError::FeeTooHigh
        );

        let config = &mut ctx.accounts.config;
        config.client_fee_bps = client_fee_bps;
        config.contractor_fee_bps = contractor_fee_bps;
        config.inspector_fee_bps = inspector_fee_bps;

        Ok(())
    }

    /// Client opens a project against a named contractor and inspector.
    pub fn create_project(
        ctx: Context<CreateProject>,
        project_id: u64,
        milestone_count: u8,
    ) -> Result<()> {
        require!(milestone_count > 0, EscrowError::MilestoneIndexOutOfRange);

        let project = &mut ctx.accounts.project;
        project.client = ctx.accounts.client.key();
        project.contractor = ctx.accounts.contractor.key();
        project.inspector = ctx.accounts.inspector.key();
        project.mint = ctx.accounts.mint.key();
        project.project_id = project_id;
        project.milestone_count = milestone_count;
        project.milestones_released = 0;
        project.total_escrowed = 0;
        project.status = ProjectStatus::Active;
        project.bump = ctx.bumps.project;

        Ok(())
    }

    /// Define one stage of work and what it pays. Client only, before funding.
    pub fn add_milestone(
        ctx: Context<AddMilestone>,
        index: u8,
        amount: u64,
        inspection_fee: u64,
    ) -> Result<()> {
        let project = &ctx.accounts.project;
        require!(
            project.status == ProjectStatus::Active,
            EscrowError::ProjectNotActive
        );
        require!(
            index < project.milestone_count,
            EscrowError::MilestoneIndexOutOfRange
        );
        require!(amount > 0, EscrowError::ZeroAmount);

        let milestone = &mut ctx.accounts.milestone;
        milestone.project = project.key();
        milestone.index = index;
        milestone.amount = amount;
        milestone.inspection_fee = inspection_fee;
        milestone.status = MilestoneStatus::Pending;
        milestone.inspector_approved = false;
        milestone.client_approved = false;
        milestone.evidence_uri = String::new();
        milestone.bump = ctx.bumps.milestone;

        Ok(())
    }

    /// Client moves money in. The protocol fee is taken here, on top of the
    /// escrowed amount, and goes straight to the treasury — it never enters
    /// the vault, so it can never be confused with the contractor's money.
    pub fn fund_milestone(ctx: Context<FundMilestone>) -> Result<()> {
        let config = &ctx.accounts.config;
        let milestone = &ctx.accounts.milestone;

        require!(
            ctx.accounts.project.status == ProjectStatus::Active,
            EscrowError::ProjectNotActive
        );
        require!(
            milestone.status == MilestoneStatus::Pending,
            EscrowError::MilestoneAlreadyFunded
        );

        let (escrowed, client_fee) = milestone
            .funding_total(config.client_fee_bps)
            .ok_or(EscrowError::MathOverflow)?;

        // Escrowed portion -> vault owned by the project PDA.
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.client_token_account.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.client.to_account_info(),
                },
            ),
            escrowed,
        )?;

        // Protocol fee -> treasury, immediately.
        if client_fee > 0 {
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.client_token_account.to_account_info(),
                        to: ctx.accounts.treasury_token_account.to_account_info(),
                        authority: ctx.accounts.client.to_account_info(),
                    },
                ),
                client_fee,
            )?;
        }

        let project = &mut ctx.accounts.project;
        project.total_escrowed = project
            .total_escrowed
            .checked_add(escrowed)
            .ok_or(EscrowError::MathOverflow)?;

        ctx.accounts.milestone.status = MilestoneStatus::Funded;

        emit!(MilestoneFunded {
            project: project.key(),
            index: ctx.accounts.milestone.index,
            escrowed,
            client_fee,
        });

        Ok(())
    }

    /// Contractor marks a stage complete and attaches proof.
    pub fn submit_milestone(ctx: Context<SubmitMilestone>, evidence_uri: String) -> Result<()> {
        require!(
            evidence_uri.len() <= MAX_EVIDENCE_URI_LEN,
            EscrowError::EvidenceUriTooLong
        );
        require!(
            ctx.accounts.project.status == ProjectStatus::Active,
            EscrowError::ProjectNotActive
        );

        let milestone = &mut ctx.accounts.milestone;
        require!(
            milestone.status == MilestoneStatus::Funded,
            EscrowError::MilestoneNotFunded
        );

        milestone.evidence_uri = evidence_uri;
        milestone.status = MilestoneStatus::Submitted;

        emit!(MilestoneSubmitted {
            project: ctx.accounts.project.key(),
            index: milestone.index,
        });

        Ok(())
    }

    /// Inspector or client signs off. The second of the two triggers payout in
    /// the same transaction, so funds are never left in a half-approved state.
    pub fn approve_milestone(ctx: Context<ApproveMilestone>) -> Result<()> {
        let project_key = ctx.accounts.project.key();
        let signer = ctx.accounts.signer.key();
        let is_inspector = signer == ctx.accounts.project.inspector;
        let is_client = signer == ctx.accounts.project.client;

        require!(is_inspector || is_client, EscrowError::NotAnApprover);
        require!(
            ctx.accounts.project.status == ProjectStatus::Active,
            EscrowError::ProjectNotActive
        );
        require!(
            ctx.accounts.milestone.status == MilestoneStatus::Submitted,
            EscrowError::MilestoneNotSubmitted
        );

        {
            let milestone = &mut ctx.accounts.milestone;
            if is_inspector {
                require!(!milestone.inspector_approved, EscrowError::AlreadyApproved);
                milestone.inspector_approved = true;
            } else {
                require!(!milestone.client_approved, EscrowError::AlreadyApproved);
                milestone.client_approved = true;
            }

            emit!(MilestoneApproved {
                project: project_key,
                index: milestone.index,
                by: signer,
                inspector_approved: milestone.inspector_approved,
                client_approved: milestone.client_approved,
            });

            // Still waiting on the other party.
            if !(milestone.inspector_approved && milestone.client_approved) {
                return Ok(());
            }
        }

        release(ctx)
    }

    /// Client pulls funding back — only before the contractor has submitted
    /// work, so a contractor can never lose money for work already delivered.
    pub fn refund_milestone(ctx: Context<RefundMilestone>) -> Result<()> {
        let milestone_status = ctx.accounts.milestone.status;
        require!(
            milestone_status == MilestoneStatus::Funded,
            EscrowError::RefundNotAllowed
        );

        let milestone_amount = ctx.accounts.milestone.amount;
        let inspection_fee = ctx.accounts.milestone.inspection_fee;
        let refund = milestone_amount
            .checked_add(inspection_fee)
            .ok_or(EscrowError::MathOverflow)?;

        let client = ctx.accounts.project.client;
        let project_id = ctx.accounts.project.project_id;
        let bump = ctx.accounts.project.bump;
        let seeds: &[&[u8]] = &[
            b"project",
            client.as_ref(),
            &project_id.to_le_bytes(),
            &[bump],
        ];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.client_token_account.to_account_info(),
                    authority: ctx.accounts.project.to_account_info(),
                },
                &[seeds],
            ),
            refund,
        )?;

        let project = &mut ctx.accounts.project;
        project.total_escrowed = project
            .total_escrowed
            .checked_sub(refund)
            .ok_or(EscrowError::MathOverflow)?;

        ctx.accounts.milestone.status = MilestoneStatus::Refunded;

        emit!(MilestoneRefunded {
            project: project.key(),
            index: ctx.accounts.milestone.index,
            amount: refund,
        });

        Ok(())
    }
}

/// Pays out a fully approved milestone in a single atomic transaction:
/// contractor and inspector are paid their net amounts and the protocol takes
/// its cut, all or nothing.
fn release(ctx: Context<ApproveMilestone>) -> Result<()> {
    let config = &ctx.accounts.config;
    let amount = ctx.accounts.milestone.amount;
    let inspection_fee = ctx.accounts.milestone.inspection_fee;

    let contractor_fee =
        state::fee_of(amount, config.contractor_fee_bps).ok_or(EscrowError::MathOverflow)?;
    let inspector_fee =
        state::fee_of(inspection_fee, config.inspector_fee_bps).ok_or(EscrowError::MathOverflow)?;

    let contractor_net = amount
        .checked_sub(contractor_fee)
        .ok_or(EscrowError::MathOverflow)?;
    let inspector_net = inspection_fee
        .checked_sub(inspector_fee)
        .ok_or(EscrowError::MathOverflow)?;
    let protocol_cut = contractor_fee
        .checked_add(inspector_fee)
        .ok_or(EscrowError::MathOverflow)?;

    let client = ctx.accounts.project.client;
    let project_id = ctx.accounts.project.project_id;
    let bump = ctx.accounts.project.bump;
    let seeds: &[&[u8]] = &[
        b"project",
        client.as_ref(),
        &project_id.to_le_bytes(),
        &[bump],
    ];
    let signer_seeds = &[seeds];

    let vault = ctx.accounts.vault.to_account_info();
    let authority = ctx.accounts.project.to_account_info();
    let token_program = ctx.accounts.token_program.to_account_info();

    if contractor_net > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                token_program.clone(),
                Transfer {
                    from: vault.clone(),
                    to: ctx.accounts.contractor_token_account.to_account_info(),
                    authority: authority.clone(),
                },
                signer_seeds,
            ),
            contractor_net,
        )?;
    }

    if inspector_net > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                token_program.clone(),
                Transfer {
                    from: vault.clone(),
                    to: ctx.accounts.inspector_token_account.to_account_info(),
                    authority: authority.clone(),
                },
                signer_seeds,
            ),
            inspector_net,
        )?;
    }

    if protocol_cut > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                token_program,
                Transfer {
                    from: vault,
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority,
                },
                signer_seeds,
            ),
            protocol_cut,
        )?;
    }

    let released_total = amount
        .checked_add(inspection_fee)
        .ok_or(EscrowError::MathOverflow)?;

    let project = &mut ctx.accounts.project;
    project.total_escrowed = project
        .total_escrowed
        .checked_sub(released_total)
        .ok_or(EscrowError::MathOverflow)?;
    project.milestones_released = project
        .milestones_released
        .checked_add(1)
        .ok_or(EscrowError::MathOverflow)?;
    if project.milestones_released == project.milestone_count {
        project.status = ProjectStatus::Completed;
    }

    ctx.accounts.milestone.status = MilestoneStatus::Released;

    emit!(MilestoneReleased {
        project: project.key(),
        index: ctx.accounts.milestone.index,
        contractor_net,
        inspector_net,
        protocol_cut,
    });

    Ok(())
}

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: fee destination, validated only as a pubkey we store.
    pub treasury: UncheckedAccount<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + Config::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateFees<'info> {
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        has_one = authority
    )]
    pub config: Account<'info, Config>,
}

#[derive(Accounts)]
#[instruction(project_id: u64)]
pub struct CreateProject<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    /// CHECK: stored as the only wallet allowed to submit work.
    pub contractor: UncheckedAccount<'info>,
    /// CHECK: stored as the only wallet allowed to give inspector approval.
    pub inspector: UncheckedAccount<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = client,
        space = 8 + Project::INIT_SPACE,
        seeds = [b"project", client.key().as_ref(), &project_id.to_le_bytes()],
        bump
    )]
    pub project: Account<'info, Project>,
    /// Vault holding every funded milestone for this project, owned by the
    /// project PDA rather than by any person.
    #[account(
        init,
        payer = client,
        associated_token::mint = mint,
        associated_token::authority = project
    )]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(index: u8)]
pub struct AddMilestone<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    #[account(
        seeds = [b"project", project.client.as_ref(), &project.project_id.to_le_bytes()],
        bump = project.bump,
        has_one = client
    )]
    pub project: Account<'info, Project>,
    #[account(
        init,
        payer = client,
        space = 8 + Milestone::INIT_SPACE,
        seeds = [b"milestone", project.key().as_ref(), &[index]],
        bump
    )]
    pub milestone: Account<'info, Milestone>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FundMilestone<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, Config>,
    #[account(
        mut,
        seeds = [b"project", project.client.as_ref(), &project.project_id.to_le_bytes()],
        bump = project.bump,
        has_one = client
    )]
    pub project: Account<'info, Project>,
    #[account(
        mut,
        seeds = [b"milestone", project.key().as_ref(), &[milestone.index]],
        bump = milestone.bump,
        constraint = milestone.project == project.key() @ EscrowError::MilestoneIndexOutOfRange
    )]
    pub milestone: Account<'info, Milestone>,
    #[account(
        mut,
        constraint = client_token_account.owner == client.key() @ EscrowError::TokenAccountOwnerMismatch,
        constraint = client_token_account.mint == project.mint @ EscrowError::MintMismatch
    )]
    pub client_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = project
    )]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = treasury_token_account.owner == config.treasury @ EscrowError::TokenAccountOwnerMismatch,
        constraint = treasury_token_account.mint == project.mint @ EscrowError::MintMismatch
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    #[account(address = project.mint @ EscrowError::MintMismatch)]
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SubmitMilestone<'info> {
    #[account(
        constraint = contractor.key() == project.contractor @ EscrowError::NotAnApprover
    )]
    pub contractor: Signer<'info>,
    #[account(
        seeds = [b"project", project.client.as_ref(), &project.project_id.to_le_bytes()],
        bump = project.bump
    )]
    pub project: Account<'info, Project>,
    #[account(
        mut,
        seeds = [b"milestone", project.key().as_ref(), &[milestone.index]],
        bump = milestone.bump,
        constraint = milestone.project == project.key() @ EscrowError::MilestoneIndexOutOfRange
    )]
    pub milestone: Account<'info, Milestone>,
}

#[derive(Accounts)]
pub struct ApproveMilestone<'info> {
    pub signer: Signer<'info>,
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, Config>,
    #[account(
        mut,
        seeds = [b"project", project.client.as_ref(), &project.project_id.to_le_bytes()],
        bump = project.bump
    )]
    pub project: Account<'info, Project>,
    #[account(
        mut,
        seeds = [b"milestone", project.key().as_ref(), &[milestone.index]],
        bump = milestone.bump,
        constraint = milestone.project == project.key() @ EscrowError::MilestoneIndexOutOfRange
    )]
    pub milestone: Account<'info, Milestone>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = project
    )]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = contractor_token_account.owner == project.contractor @ EscrowError::TokenAccountOwnerMismatch,
        constraint = contractor_token_account.mint == project.mint @ EscrowError::MintMismatch
    )]
    pub contractor_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = inspector_token_account.owner == project.inspector @ EscrowError::TokenAccountOwnerMismatch,
        constraint = inspector_token_account.mint == project.mint @ EscrowError::MintMismatch
    )]
    pub inspector_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = treasury_token_account.owner == config.treasury @ EscrowError::TokenAccountOwnerMismatch,
        constraint = treasury_token_account.mint == project.mint @ EscrowError::MintMismatch
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    #[account(address = project.mint @ EscrowError::MintMismatch)]
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RefundMilestone<'info> {
    #[account(constraint = client.key() == project.client @ EscrowError::NotAnApprover)]
    pub client: Signer<'info>,
    #[account(
        mut,
        seeds = [b"project", project.client.as_ref(), &project.project_id.to_le_bytes()],
        bump = project.bump
    )]
    pub project: Account<'info, Project>,
    #[account(
        mut,
        seeds = [b"milestone", project.key().as_ref(), &[milestone.index]],
        bump = milestone.bump,
        constraint = milestone.project == project.key() @ EscrowError::MilestoneIndexOutOfRange
    )]
    pub milestone: Account<'info, Milestone>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = project
    )]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = client_token_account.owner == client.key() @ EscrowError::TokenAccountOwnerMismatch,
        constraint = client_token_account.mint == project.mint @ EscrowError::MintMismatch
    )]
    pub client_token_account: Account<'info, TokenAccount>,
    #[account(address = project.mint @ EscrowError::MintMismatch)]
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

// ---------------------------------------------------------------------------
// Events — the audit trail the UI and any third party can replay.
// ---------------------------------------------------------------------------

#[event]
pub struct MilestoneFunded {
    pub project: Pubkey,
    pub index: u8,
    pub escrowed: u64,
    pub client_fee: u64,
}

#[event]
pub struct MilestoneSubmitted {
    pub project: Pubkey,
    pub index: u8,
}

#[event]
pub struct MilestoneApproved {
    pub project: Pubkey,
    pub index: u8,
    pub by: Pubkey,
    pub inspector_approved: bool,
    pub client_approved: bool,
}

#[event]
pub struct MilestoneReleased {
    pub project: Pubkey,
    pub index: u8,
    pub contractor_net: u64,
    pub inspector_net: u64,
    pub protocol_cut: u64,
}

#[event]
pub struct MilestoneRefunded {
    pub project: Pubkey,
    pub index: u8,
    pub amount: u64,
}
