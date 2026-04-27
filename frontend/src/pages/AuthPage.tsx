import { useMutation } from '@tanstack/react-query'
import { Link, Navigate, useNavigate } from '@tanstack/react-router'
import { ArrowRight, LockKeyhole, ShieldCheck, UserRound, WalletCards } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { login, register, type AuthCredentials } from '../api/auth'
import { USE_MOCKS } from '../api/mock-service'
import { useAuth } from '../state/useAuth'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Field, Input } from '../ui/field'

type AuthMode = 'login' | 'register'

export function AuthPage({ mode }: { mode: AuthMode }) {
  const auth = useAuth()
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState<AuthCredentials>({
    username: 'demo',
    password: 'demo',
  })
  const mutation = useMutation({
    mutationFn: mode === 'login' ? login : register,
    onSuccess: (data) => {
      auth.signIn(data.access_token)
      navigate({ to: '/' })
    },
  })

  if (auth.isAuthenticated) {
    return <Navigate to="/" />
  }

  const title = mode === 'login' ? 'Войти в Transan' : 'Создать доступ'
  const action = mode === 'login' ? 'Войти' : 'Зарегистрироваться'

  return (
    <main className="premium-bg dark grid min-h-screen place-items-center px-4 py-8 text-white">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="relative flex min-h-[620px] overflow-hidden rounded-2xl border border-white/10 bg-[#071014] p-8 shadow-2xl shadow-black/40"
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.45 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_16%,rgba(52,211,153,0.28),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(59,130,246,0.2),transparent_32%)]" />
          <div className="relative z-10 flex w-full flex-col justify-between">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="metric-shine flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-300 via-emerald-500 to-cyan-500 text-slate-950">
                  <WalletCards className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl font-bold">Transan</div>
                  <div className="text-sm text-slate-300">AI spending cockpit</div>
                </div>
              </div>
              <div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
                {USE_MOCKS ? 'Mock ready' : 'API mode'}
              </div>
            </div>

            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-slate-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                Демо без backend: login demo / demo
              </div>
              <h1 className="text-4xl font-semibold leading-[1.02] md:text-6xl">
                Финансовый радар для трат, бюджета и прогноза.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                Насыщенный dashboard, быстрый импорт CSV и аналитика по категориям, которую можно проверить уже сейчас на mock-данных.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['-18%', 'риск перерасхода'],
                ['42', 'операции в демо'],
                ['31 дн.', 'прогноз вперед'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="mt-1 text-xs font-medium text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 24 }}
          transition={{ delay: 0.1, duration: 0.45 }}
        >
          <Card className="self-center rounded-2xl p-6 sm:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
                {title}
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {USE_MOCKS
                  ? 'Введите любые непустые данные или оставьте demo / demo.'
                  : 'Подключение к реальному backend API.'}
              </p>
            </div>

            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                mutation.mutate(credentials)
              }}
            >
              <Field label="Логин">
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="pl-10"
                    required
                    value={credentials.username}
                    onChange={(event) =>
                      setCredentials((current) => ({
                        ...current,
                        username: event.target.value,
                      }))
                    }
                  />
                </div>
              </Field>

              <Field label="Пароль">
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="pl-10"
                    required
                    type="password"
                    value={credentials.password}
                    onChange={(event) =>
                      setCredentials((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                  />
                </div>
              </Field>

              {mutation.isError ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100">
                  {mutation.error.message}
                </div>
              ) : null}

              <Button className="mt-2 w-full" disabled={mutation.isPending} size="lg" type="submit">
                {mutation.isPending ? 'Проверяем' : action}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {mode === 'login' ? (
                <Link className="font-semibold text-emerald-700 dark:text-emerald-300" to="/register">
                  Создать аккаунт
                </Link>
              ) : (
                <Link className="font-semibold text-emerald-700 dark:text-emerald-300" to="/login">
                  Уже есть аккаунт
                </Link>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
