import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BrainCircuit, CreditCard, Landmark, TrendingUp, Wallet } from 'lucide-react'
import type { CSSProperties } from 'react'
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { USE_MOCKS } from '../api/mock-service'
import { fetchForecast, fetchSpendings } from '../api/spendings'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { ImportCsvButton } from '../components/ImportCsvButton'
import {
  categoryTotals,
  dateTrend,
  sumSpendings,
  topCurrency,
} from '../features/spendings/analytics'
import { formatCompactMoney, formatDate, formatMoney, percent } from '../lib/format'
import { Card, CardHeader, CardTitle } from '../ui/card'
import { ErrorState, LoadingState } from '../ui/status'

const chartColors = ['#34d399', '#60a5fa', '#fbbf24', '#fb7185', '#a78bfa']
const monthlyBudget = 185_000

export function DashboardPage() {
  const spendingsQuery = useQuery({
    queryKey: ['spendings', 'dashboard'],
    queryFn: () => fetchSpendings({ page: 1, size: 100 }),
  })
  const forecastQuery = useQuery({
    queryKey: ['forecast', 'dashboard'],
    queryFn: () => fetchForecast({ page: 1, size: 40 }),
  })

  if (spendingsQuery.isLoading) {
    return <LoadingState label="Загружаем аналитику" />
  }

  if (spendingsQuery.isError) {
    return <ErrorState message={spendingsQuery.error.message} />
  }

  const spendingsPage = spendingsQuery.data

  if (!spendingsPage) {
    return <LoadingState label="Загружаем аналитику" />
  }

  const spendings = spendingsPage.items
  const forecast = forecastQuery.data?.items ?? []
  const currency = topCurrency(spendings)
  const total = sumSpendings(spendings)
  const forecastTotal = sumSpendings(forecast)
  const budgetUsed = percent(total, monthlyBudget)
  const categories = categoryTotals(spendings).slice(0, 5)
  const trend = dateTrend(spendings)
  const recent = [...spendings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
  const projectedDelta = forecastTotal - total

  return (
    <div className="grid gap-6">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="aurora-border relative overflow-hidden rounded-2xl p-6 shadow-2xl shadow-black/10 dark:shadow-black/30"
        initial={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(52,211,153,0.2),transparent_28%),radial-gradient(circle_at_88%_20%,rgba(96,165,250,0.18),transparent_30%)]" />
        <div className="relative z-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-200">
              Premium fintech dashboard
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.04] text-slate-950 dark:text-white md:text-6xl">
              Анализ трат в живом финансовом cockpit.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {USE_MOCKS
                ? 'Сейчас показаны mock-данные: можно оценить визуал, графики, импорт и CRUD без работающего backend.'
                : 'Live-режим подключен к backend, отдельной базе транзакций и Kafka-контуру logic-core для прогноза.'}
            </p>
          </div>
          <div className="grid content-end gap-3 sm:grid-cols-2">
            <HeroStat label="Расходы" value={total} formatter={(value) => formatMoney(value, currency)} />
            <HeroStat label="Прогноз" value={forecastTotal} formatter={(value) => formatMoney(value, currency)} />
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<CreditCard className="h-5 w-5" />}
          label="Расходы"
          tone="emerald"
          value={<AnimatedNumber format={(value) => formatMoney(value, currency)} value={total} />}
        />
        <MetricCard
          icon={<Landmark className="h-5 w-5" />}
          label="Бюджет использован"
          tone="blue"
          value={<AnimatedNumber format={(value) => `${Math.round(value)}%`} value={budgetUsed} />}
        />
        <MetricCard
          icon={<BrainCircuit className="h-5 w-5" />}
          label="Прогноз модели"
          tone="amber"
          value={
            forecastQuery.isLoading ? (
              '...'
            ) : (
              <AnimatedNumber format={(value) => formatMoney(value, currency)} value={forecastTotal} />
            )
          }
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Операции"
          tone="rose"
          value={String(spendingsPage.total)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="rounded-2xl">
          <CardHeader>
            <div>
              <CardTitle>Динамика</CardTitle>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Последние дни расходов
              </p>
            </div>
            <ImportCsvButton />
          </CardHeader>
          <div className="h-80">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="spendingAreaPremium" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.42} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis tickFormatter={(value) => formatCompactMoney(Number(value), currency)} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(148,163,184,.25)',
                    background: 'rgba(7,16,20,.92)',
                    color: '#fff',
                  }}
                  formatter={(value) => formatMoney(Number(value), currency)}
                  labelFormatter={(label) => formatDate(String(label))}
                />
                <Area
                  dataKey="value"
                  fill="url(#spendingAreaPremium)"
                  stroke="#34d399"
                  strokeWidth={3}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Категории</CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie data={categories} dataKey="value" innerRadius={58} outerRadius={94} paddingAngle={4}>
                  {categories.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatMoney(Number(value), currency)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2">
            {categories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: chartColors[index % chartColors.length] }}
                  />
                  <span className="truncate">{category.name}</span>
                </span>
                <span className="font-semibold text-slate-950 dark:text-white">
                  {formatCompactMoney(category.value, currency)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Бюджет</CardTitle>
            <Wallet className="h-5 w-5 text-emerald-400" />
          </CardHeader>
          <div className="relative mx-auto grid h-44 w-44 place-items-center rounded-full bg-[conic-gradient(#34d399_var(--progress),rgba(255,255,255,0.1)_0)]" style={{ '--progress': `${Math.min(budgetUsed, 100)}%` } as CSSProperties}>
            <div className="grid h-32 w-32 place-items-center rounded-full bg-white dark:bg-[#091014]">
              <div className="text-center">
                <div className="text-3xl font-bold">{budgetUsed}%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">использовано</div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Остаток до {USE_MOCKS ? 'demo-бюджета' : 'месячного бюджета'}:{' '}
            <strong className="text-slate-950 dark:text-white">
              {formatMoney(Math.max(monthlyBudget - total, 0), currency)}
            </strong>
          </p>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <div>
              <CardTitle>Последние операции</CardTitle>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Прогнозная разница: {formatMoney(projectedDelta, currency)}
              </p>
            </div>
          </CardHeader>
          <div className="grid gap-3">
            {recent.map((spending, index) => (
              <motion.div
                key={spending.id}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-[1fr_auto] gap-3 rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]"
                initial={{ opacity: 0, x: 14 }}
                transition={{ delay: index * 0.04 }}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                    {spending.bank_description || spending.category_name}
                  </div>
                  <div className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {spending.category_name} · {formatDate(spending.date)}
                  </div>
                </div>
                <div className="text-right text-sm font-bold text-slate-950 dark:text-white">
                  {formatMoney(spending.sum, spending.currency)}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}

function HeroStat({
  label,
  value,
  formatter,
}: {
  label: string
  value: number
  formatter: (value: number) => string
}) {
  return (
    <div className="metric-shine rounded-2xl border border-white/10 bg-white/[0.07] p-4">
      <div className="text-xs font-bold uppercase tracking-normal text-slate-400">
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold text-white">
        <AnimatedNumber format={formatter} value={value} />
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  tone: 'emerald' | 'blue' | 'amber' | 'rose'
}) {
  const toneClasses = {
    emerald: 'bg-emerald-400/15 text-emerald-300',
    blue: 'bg-blue-400/15 text-blue-300',
    amber: 'bg-amber-400/15 text-amber-200',
    rose: 'bg-rose-400/15 text-rose-200',
  }

  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card className="metric-shine rounded-2xl">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{label}</CardTitle>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
            {icon}
          </div>
        </div>
        <div className="mt-6 text-2xl font-semibold text-slate-950 dark:text-white">
          {value}
        </div>
      </Card>
    </motion.div>
  )
}
