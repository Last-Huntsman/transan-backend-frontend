import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import {
  BarChart3,
  BrainCircuit,
  CreditCard,
  DatabaseZap,
  LogOut,
  Menu,
  Moon,
  Sun,
  WalletCards,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { USE_MOCKS } from '../api/mock-service'
import { cn } from '../lib/utils'
import { useAuth } from '../state/useAuth'
import { Button } from '../ui/button'

const navItems = [
  { to: '/', label: 'Обзор', icon: BarChart3 },
  { to: '/transactions', label: 'Транзакции', icon: CreditCard },
  { to: '/forecast', label: 'Прогноз', icon: BrainCircuit },
] as const

export function AppLayout() {
  const { signOut } = useAuth()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const [isDark, setIsDark] = useState<boolean>(() => true)
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <div className="premium-bg min-h-screen text-slate-950 dark:text-white">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-72 border-r border-slate-200/70 bg-white/82 px-5 py-5 backdrop-blur-2xl transition-transform dark:border-white/10 dark:bg-[#071014]/88 lg:translate-x-0',
          navOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="mb-8 flex items-center gap-3">
            <div className="metric-shine flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-300 via-emerald-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-950/30">
              <WalletCards className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold">Transan</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Premium spending analytics
              </div>
            </div>
          </div>

          <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs leading-5 text-emerald-900 dark:text-emerald-100">
            <div className="font-bold">Демо-режим активен</div>
            <div className="text-slate-600 dark:text-slate-300">
              Можно проверять дизайн, CRUD и импорт без backend.
            </div>
          </div>

          <nav className="grid gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.to

              return (
                <Link
                  key={item.to}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition',
                    active
                      ? 'bg-white text-slate-950 shadow-xl shadow-emerald-950/10 dark:bg-white/[0.09] dark:text-white'
                      : 'text-slate-600 hover:bg-slate-900/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white',
                  )}
                  to={item.to}
                  onClick={() => setNavOpen(false)}
                >
                  {active ? (
                    <motion.span
                      className="absolute inset-y-2 left-0 w-1 rounded-full bg-emerald-400"
                      layoutId="activeNav"
                    />
                  ) : null}
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto grid gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDark((value) => !value)}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDark ? 'Светлая тема' : 'Темная тема'}
            </Button>
            <Button type="button" variant="ghost" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Выйти
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/70 bg-white/70 px-4 backdrop-blur-2xl dark:border-white/10 dark:bg-[#071014]/70 lg:px-8">
          <Button
            aria-label="Открыть меню"
            className="lg:hidden"
            size="icon"
            type="button"
            variant="ghost"
            onClick={() => setNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-normal text-slate-500 dark:text-slate-400">
              Финансы
            </div>
            <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              Контроль расходов и прогноз
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">
            <DatabaseZap className="h-3.5 w-3.5 text-emerald-400" />
            {USE_MOCKS ? 'Mock data' : 'Live API'}
          </div>
        </header>

        <motion.main
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8"
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}
