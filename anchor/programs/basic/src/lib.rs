use anchor_lang::prelude::*;

declare_id!("BuUjpxSaVGH7jgm1q7Ya1qVTQCkWSeCtKkF8j14SyxNp");

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
