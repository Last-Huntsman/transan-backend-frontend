import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CalendarClock, Gauge, Sigma, Sparkles } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { fetchForecast, fetchSpendings } from '../api/spendings'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { categoryTotals, sumSpendings, topCurrency } from '../features/spendings/analytics'
import { formatCompactMoney, formatDate, formatMoney } from '../lib/format'
import { Card, CardHeader, CardTitle } from '../ui/card'
import { ErrorState, LoadingState } from '../ui/status'

export function ForecastPage() {
  const forecastQuery = useQuery({
    queryKey: ['forecast', 'page'],
    queryFn: () => fetchForecast({ page: 1, size: 100 }),
  })
  const spendingsQuery = useQuery({
    queryKey: ['spendings', 'forecast-comparison'],
    queryFn: () => fetchSpendings({ page: 1, size: 100 }),
  })

  if (forecastQuery.isLoading) {
    return <LoadingState label="Загружаем прогноз" />
  }

  if (forecastQuery.isError) {
    return <ErrorState message={forecastQuery.error.message} />
  }

  const forecastPage = forecastQuery.data

  if (!forecastPage) {
    return <LoadingState label="Загружаем прогноз" />
  }

  const forecast = forecastPage.items
  const history = spendingsQuery.data?.items ?? []
  const currency = topCurrency(forecast.length ? forecast : history)
  const forecastTotal = sumSpendings(forecast)
  const historyTotal = sumSpendings(history)
  const delta = forecastTotal - historyTotal
  const chartData = categoryTotals(forecast).slice(0, 8)
  const next = [...forecast].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8)

  return (
    <div className="grid gap-6">
      <section className="aurora-border rounded-2xl p-6">
        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="text-xs font-bold uppercase tracking-normal text-blue-600 dark:text-blue-300">
              Forecast engine
            </div>
            <h1 className="mt-2 text-4xl font-semibold text-slate-950 dark:text-white">
              Прогноз расходов
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Демо-модель показывает ожидаемые траты следующего периода и подсвечивает категории риска.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-200">
              <Gauge className="h-4 w-4" />
              Инсайт
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
              Самый заметный риск: еда вне дома и подписки. Если оставить текущий ритм, прогноз будет выше истории на {formatMoney(delta, currency)}.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ForecastMetric
          icon={<Sigma className="h-5 w-5" />}
          label="Прогноз"
          value={<AnimatedNumber format={(value) => formatMoney(value, currency)} value={forecastTotal} />}
        />
        <ForecastMetric
          icon={<CalendarClock className="h-5 w-5" />}
          label="Операций"
          value={String(forecastPage.total)}
        />
        <ForecastMetric
          icon={<Sparkles className="h-5 w-5" />}
          label="Разница"
          value={<AnimatedNumber format={(value) => formatMoney(value, currency)} value={delta} />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Категории прогноза</CardTitle>
          </CardHeader>
          <div className="h-96">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCompactMoney(Number(value), currency)} />
                <Tooltip formatter={(value) => formatMoney(Number(value), currency)} />
                <Bar dataKey="value" fill="#60a5fa" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Ближайшие траты</CardTitle>
          </CardHeader>
          <div className="grid gap-3">
            {next.map((spending, index) => (
              <motion.div
                key={spending.id}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-[1fr_auto] gap-3 rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: index * 0.04 }}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                    {spending.category_name}
                  </div>
                  <div className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {spending.bank_description || spending.comment || formatDate(spending.date)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-950 dark:text-white">
                    {formatMoney(spending.sum, spending.currency)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(spending.date)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}

function ForecastMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card className="metric-shine rounded-2xl">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{label}</CardTitle>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/15 text-blue-300">
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
