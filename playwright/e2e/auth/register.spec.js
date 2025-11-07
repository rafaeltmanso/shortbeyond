import { test, expect } from '../../support/fixtures.js'

import { getUser } from '../../support/factories/user.js'
import { registerService } from '../../support/services/auth.js'

test.describe('POST /auth/register', () => {
  let register

  test.beforeEach(async ({ request }) => {
    register = registerService(request)
  })

  test('should successfully register a new user', async ({ request }) => {
    const user = getUser()

    const response = await register.createUser(user)

    expect(response.status()).toBe(201)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty(
      'message',
      'Usuário cadastrado com sucesso!'
    )
    expect(responseBody.user).toHaveProperty('id')
    expect(responseBody.user).toHaveProperty('name', user.name)
    expect(responseBody.user).toHaveProperty('email', user.email)
    expect(responseBody.user).not.toHaveProperty('password')
  })

  test('should not register when email is already in use', async ({
    request,
  }) => {
    const user = getUser()

    const preCondition = await register.createUser(user)

    expect(preCondition.status()).toBe(201)

    const response = await register.createUser(user)
    expect(response.status()).toBe(400)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty(
      'message',
      'Este e-mail já está em uso. Por favor, tente outro.'
    )
  })

  test('should not register when email is incorrect', async ({ request }) => {
    const user = {
      name: 'Fernando Silva',
      email: 'fernando.silva.com.br',
      password: 'senha123',
    }

    const response = await register.createUser(user)
    expect(response.status()).toBe(400)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty(
      'message',
      "O campo 'Email' deve ser um email válido"
    )
  })

  test('should not register when name is missing', async ({ request }) => {
    const user = {
      email: 'fernando.silva.com.br',
      password: 'senha123',
    }

    const response = await register.createUser(user)
    expect(response.status()).toBe(400)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty(
      'message',
      "O campo 'Name' é obrigatório"
    )
  })

  test('should not register when email is missing', async ({ request }) => {
    const user = {
      name: 'Fernando Silva',
      password: 'senha123',
    }

    const response = await register.createUser(user)
    expect(response.status()).toBe(400)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty(
      'message',
      "O campo 'Email' é obrigatório"
    )
  })

  test('should not register when password is missing', async ({ request }) => {
    const user = {
      name: 'Fernando Silva',
      email: 'fernando.silva@example.com',
    }

    const response = await register.createUser(user)
    expect(response.status()).toBe(400)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty(
      'message',
      "O campo 'Password' é obrigatório"
    )
  })
})
