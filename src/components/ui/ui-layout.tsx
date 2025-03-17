'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import { ReactNode, Suspense, useEffect, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'

import { AccountChecker } from '../account/account-ui'
import { ClusterChecker, ClusterUiSelect, ExplorerLink } from '../cluster/cluster-ui'
import { WalletButton } from '../solana/solana-provider'

export function UiLayout({ children, links }: { children: ReactNode; links: { label: string; path: string }[] }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <Link 
                className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity" 
                href="/"
              >
                BaseBET
              </Link>
              <ul className="hidden md:flex items-center space-x-1">
                {links.map(({ label, path }) => (
                  <li key={path}>
                    <Link 
                      className={`px-4 py-2 rounded-lg transition-colors ${pathname.startsWith(path) 
                        ? 'bg-emerald-400/10 text-emerald-400' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'}`} 
                      href={path}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center space-x-3">
              <WalletButton />
              <ClusterUiSelect />
            </div>
          </div>
        </div>
      </nav>
      <ClusterChecker>
        <AccountChecker />
      </ClusterChecker>
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 py-6">
        <Suspense
          fallback={
            <div className="text-center my-32">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          }
        >
          {children}
        </Suspense>
        <Toaster position="bottom-right" />
      </div>
    </div>
  )
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}: {
  children: ReactNode
  title: string
  hide: () => void
  show: boolean
  submit?: () => void
  submitDisabled?: boolean
  submitLabel?: string
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    if (!dialogRef.current) return
    if (show) {
      dialogRef.current.showModal()
    } else {
      dialogRef.current.close()
    }
  }, [show, dialogRef])

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-xl p-6 max-w-md w-full text-white space-y-5">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent">
          {title}
        </h3>
        {children}
        <div className="flex justify-end space-x-3 pt-4">
          <div className="flex space-x-2">
            {submit ? (
              <button 
                className="px-4 py-2 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/20 transition-colors disabled:opacity-50" 
                onClick={submit} 
                disabled={submitDisabled}
              >
                {submitLabel || 'Save'}
              </button>
            ) : null}
            <button 
              onClick={hide} 
              className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}

export function AppHero({
  children,
  title,
  subtitle,
}: {
  children?: ReactNode
  title: ReactNode
  subtitle: ReactNode
}) {
  return (
    <div className="py-16">
      <div className="text-center">
        <div className="max-w-3xl mx-auto px-4">
          {typeof title === 'string' ? (
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent mb-4">
              {title}
            </h1>
          ) : (
            title
          )}
          {typeof subtitle === 'string' ? (
            <p className="text-lg text-emerald-400/80">{subtitle}</p>
          ) : (
            subtitle
          )}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function ellipsify(str = '', len = 4) {
  if (str.length > 30) {
    return str.substring(0, len) + '..' + str.substring(str.length - len, str.length)
  }
  return str
}

export function useTransactionToast() {
  return (signature: string) => {
    toast.success(
      <div className={'text-center'}>
        <div className="text-lg">Transaction sent</div>
        <ExplorerLink 
          path={`tx/${signature}`} 
          label={'View Transaction'} 
          className="px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm hover:bg-emerald-400/20 transition-colors" 
        />
      </div>,
    )
  }
}
