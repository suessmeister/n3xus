use anchor_lang::prelude::*;

const ANCHOR_DISCRIMINATOR: usize = 8;

declare_id!("BuUjpxSaVGH7jgm1q7Ya1qVTQCkWSeCtKkF8j14SyxNp");

#[program]
pub mod basic {
    use super::*;

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        user_account.owner = ctx.accounts.user.key();
        user_account.balance = 0;
        user_account.total_bets = 0;
        // user_account.bet_history = Vec<Bet>;
        Ok(())
    }

    // pub fn deposit(ctx: Context<ModifyBalance>, amount: u64) -> Result<()> 
    // {
    //     let user_account = &mut ctx.accounts.user_account;
    //     let user = &ctx.accounts.user;
    //     require!(user.lamports() >= amount, CustomError::InsufficientFunds);

    //     **user.to_account_info().try_borrow_mut_lamports()? -= amount;
    //     **ctx.accounts.system_program.to_account_info().try_borrow_mut_lamports()? += amount;

    //     user_account.balance += amount;
    //     Ok(())
    // }

}

#[derive(Accounts)]
#[instruction()]
pub struct InitializeUser<'info> {
    #[account(
        init, 
        space = UserAccount::INIT_SPACE + ANCHOR_DISCRIMINATOR,
        payer = user, 
        seeds = [b"user", user.key().as_ref()], 
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}


#[account]
#[derive(InitSpace)]
pub struct UserAccount {
    pub owner: Pubkey,  
    pub balance: u64,    
    pub total_bets: u64, 
}

#[error_code]
pub enum CustomError {
    #[msg("Not enough funds")]
    InsufficientFunds
}
