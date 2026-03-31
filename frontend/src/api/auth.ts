import { apiRequest } from './client'
import { mockLogin, mockRegister, USE_MOCKS } from './mock-service'
import { authResponseSchema, registrationResponseSchema } from './schemas'

export type AuthCredentials = {
  username: string
  password: string
}

export type RegistrationCredentials = AuthCredentials & {
  monthly_budget?: number
  is_male?: boolean
}

export function login(credentials: AuthCredentials) {
  if (USE_MOCKS) {
    return mockLogin(credentials)
  }

  return apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
    schema: authResponseSchema,
  })
}

export function register(credentials: RegistrationCredentials) {
  if (USE_MOCKS) {
    return mockRegister(credentials)
  }

  return apiRequest('/auth/registration', {
    method: 'POST',
    body: credentials,
    schema: registrationResponseSchema,
  })
}
