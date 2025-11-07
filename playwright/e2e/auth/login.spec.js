import { test, expect } from '../../support/fixtures.js'

import { getUser } from '../../support/factories/user.js'
import { registerService } from '../../support/services/auth.js'
import { loginService } from '../../support/services/auth.js'

test.describe('POST /auth/login', () => {
  let register
  let login

  test.beforeEach(async ({ request }) => {
    register = registerService(request)
    login = loginService(request)
  })

  test('should successfully login', async ({ request }) => {
    const user = getUser()

    // Precondition: register the user
    const registerResponse = await register.createUser(user)
    expect(registerResponse.status()).toBe(201)

    // Login with correct credentials
    const credentials = {
      email: user.email,
      password: user.password,
    }

    const response = await login.login(credentials)

    expect(response.status()).toBe(200)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty(
      'message',
      'Login realizado com sucesso'
    )
    expect(responseBody).toHaveProperty('data')
    expect(responseBody.data).toHaveProperty('token')
    expect(responseBody.data.token).toBeTruthy()
    expect(responseBody.data).toHaveProperty('user')
    expect(responseBody.data.user).toHaveProperty('email')
    expect(responseBody.data.user).toHaveProperty('id')
    expect(responseBody.data.user).toHaveProperty('name')
  })
  test('should not login with incorrect email', async ({ request }) => {
    const user = getUser()

    // Precondition: register the user
    const registerResponse = await register.createUser(user)
    expect(registerResponse.status()).toBe(201)

    // Attempt login with wrong email
    const credentials = {
      email: 'email_incorreto@example.com',
      password: user.password,
    }

    const response = await login.login(credentials)

    expect(response.status()).toBe(401)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty('message', 'Credenciais inválidas')
  })

  test('should not login with incorrect password', async ({ request }) => {
    const user = getUser()

    // Precondition: register the user
    const registerResponse = await register.createUser(user)
    expect(registerResponse.status()).toBe(201)

    // Attempt login with wrong password
    const credentials = {
      email: user.email,
      password: 'senhaerrada123',
    }

    const response = await login.login(credentials)

    expect(response.status()).toBe(401)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty('message', 'Credenciais inválidas')
  })

  test('should not login when email is missing', async ({ request }) => {
    const credentials = {
      password: 'senha123',
    }

    const response = await login.login(credentials)

    expect(response.status()).toBe(400)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty(
      'message',
      "O campo 'Email' é obrigatório"
    )
  })

  test('should not login when password is missing', async ({ request }) => {
    const credentials = {
      email: 'joao@email.com',
    }

    const response = await login.login(credentials)

    expect(response.status()).toBe(400)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty(
      'message',
      "O campo 'Password' é obrigatório"
    )
  })

  test('should not login when email format is invalid', async ({ request }) => {
    const credentials = {
      email: 'emailinvalido.com.br',
      password: 'senha123',
    }

    const response = await login.login(credentials)

    expect(response.status()).toBe(400)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty(
      'message',
      "O campo 'Email' deve ser um email válido"
    )
  })

  test('should not login when sending empty fields', async ({ request }) => {
    const credentials = {
      email: '',
      password: '',
    }

    const response = await login.login(credentials)

    expect(response.status()).toBe(400)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty('message')
  })
  test('should not login with unregistered user', async ({ request }) => {
    const credentials = {
      email: 'naoexiste@example.com',
      password: 'senha123',
    }

    const response = await login.login(credentials)

    expect(response.status()).toBe(401)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty('message', 'Credenciais inválidas')
  })
})
