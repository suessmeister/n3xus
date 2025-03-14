use anchor_lang::prelude::*;

declare_id!("AsdVQZsHJFUCmNyBqxqJG17druQptKoJ3qVtzQS2uPga");

#[program]
pub mod basic {
    use super::*;

    pub fn greet(_ctx: Context<Initialize>) -> Result<()> {
        msg!("GM!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
