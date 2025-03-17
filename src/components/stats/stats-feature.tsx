'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AppHero, useTransactionToast } from '../ui/ui-layout'
import { useCluster } from '../cluster/cluster-data-access';
import { getBasicProgram } from '@project/anchor';
import { useAnchorProvider } from '../solana/solana-provider';
import { useEffect } from 'react';



export default function StatsFeature() {

   const wallet = useWallet();
   const { connection } = useConnection()
   const { cluster } = useCluster()
   const transactionToast = useTransactionToast()
   const provider = useAnchorProvider()
   const program = getBasicProgram(provider)

   useEffect(() => {
      if (wallet.connected) {
         fetchUserAccount();
      }
   });
  



  return (
    <div>
      <AppHero title="Stats" subtitle="Account Stats:" />
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">

      </div>
    </div>
  )
}
