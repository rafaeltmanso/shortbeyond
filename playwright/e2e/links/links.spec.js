import { test, expect } from '../../support/fixtures.js'

import { getUser } from '../../support/factories/user.js'
import { getLink } from '../../support/factories/link.js'
import { registerService } from '../../support/services/auth.js'
import { loginService } from '../../support/services/auth.js'
import { linksService } from '../../support/services/links.js'

test.describe('POST /links - Create shortened link', () => {
  let register
  let login
  let links

  test.beforeEach(async ({ request }) => {
    register = registerService(request)
    login = loginService(request)
    links = linksService(request)
  })

  test('should successfully create a shortened link', async ({ request }) => {
    // Precondition: register and login
    const user = getUser()
    await register.createUser(user)

    const loginResponse = await login.login({
      email: user.email,
      password: user.password,
    })
    const loginBody = await loginResponse.json()
    const token = loginBody.data.token

    // Create link
    const linkData = getLink()
    const response = await links.createLink(linkData, token)

    expect(response.status()).toBe(201)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty('message', 'Link criado com sucesso')
    expect(responseBody).toHaveProperty('data')
    expect(responseBody.data).toHaveProperty('id')
    expect(responseBody.data).toHaveProperty(
      'original_url',
      linkData.original_url
    )
    expect(responseBody.data).toHaveProperty('short_code')
    expect(responseBody.data.short_code).toMatch(/^[a-zA-Z0-9]{5}$/)
    expect(responseBody.data).toHaveProperty('title', linkData.title)
  })

  test('should not create link without authentication token', async ({
    request,
  }) => {
    const linkData = getLink()

    const response = await links.createLink(linkData, '')

    expect(response.status()).toBe(401)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty(
      'message',
      'Use o formato: Bearer <token>'
    )
  })

  test('should not create link with invalid token', async ({ request }) => {
    const linkData = getLink()
    const invalidToken = 'token-invalido-123'

    const response = await links.createLink(linkData, invalidToken)

    expect(response.status()).toBe(401)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty(
      'message',
      'token is malformed: token contains an invalid number of segments'
    )
  })

  test('should not create link without original_url field', async ({
    request,
  }) => {
    // Precondition: register and login
    const user = getUser()
    await register.createUser(user)

    const loginResponse = await login.login({
      email: user.email,
      password: user.password,
    })
    const loginBody = await loginResponse.json()
    const token = loginBody.data.token

    // Attempt to create link without original_url
    const linkData = {
      title: 'Exemplo de Site',
    }

    const response = await links.createLink(linkData, token)

    expect(response.status()).toBe(400)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty(
      'message',
      "O campo 'OriginalURL' é obrigatório"
    )
  })

  test('should not create link without title field', async ({ request }) => {
    // Precondition: register and login
    const user = getUser()
    await register.createUser(user)

    const loginResponse = await login.login({
      email: user.email,
      password: user.password,
    })
    const loginBody = await loginResponse.json()
    const token = loginBody.data.token

    // Attempt to create link without title
    const linkData = {
      original_url: 'https://www.exemplo.com/uma-url-muito-longa',
    }

    const response = await links.createLink(linkData, token)

    expect(response.status()).toBe(400)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty(
      'message',
      "O campo 'Title' é obrigatório"
    )
  })

  test('should not create link with empty original_url', async ({
    request,
  }) => {
    // Precondition: register and login
    const user = getUser()
    await register.createUser(user)

    const loginResponse = await login.login({
      email: user.email,
      password: user.password,
    })
    const loginBody = await loginResponse.json()
    const token = loginBody.data.token

    // Attempt to create link with empty URL
    const linkData = {
      original_url: '',
      title: 'Exemplo de Site',
    }

    const response = await links.createLink(linkData, token)

    expect(response.status()).toBe(400)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty('message')
  })

  test('should not create link with empty title', async ({ request }) => {
    // Precondition: register and login
    const user = getUser()
    await register.createUser(user)

    const loginResponse = await login.login({
      email: user.email,
      password: user.password,
    })
    const loginBody = await loginResponse.json()
    const token = loginBody.data.token

    // Attempt to create link with empty title
    const linkData = {
      original_url: 'https://www.exemplo.com/uma-url-muito-longa',
      title: '',
    }

    const response = await links.createLink(linkData, token)

    expect(response.status()).toBe(400)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty('message')
  })

  test('should create multiple links with unique codes', async ({
    request,
  }) => {
    // Precondition: register and login
    const user = getUser()
    await register.createUser(user)

    const loginResponse = await login.login({
      email: user.email,
      password: user.password,
    })
    const loginBody = await loginResponse.json()
    const token = loginBody.data.token

    // Create first link
    const linkData1 = getLink()
    const response1 = await links.createLink(linkData1, token)
    expect(response1.status()).toBe(201)
    const body1 = await response1.json()

    // Create second link
    const linkData2 = getLink()
    const response2 = await links.createLink(linkData2, token)
    expect(response2.status()).toBe(201)
    const body2 = await response2.json()

    // Verify that codes are different
    expect(body1.data.short_code).not.toBe(body2.data.short_code)
    expect(body1.data.id).not.toBe(body2.data.id)
  })

  test('should not create link with empty data', async ({ request }) => {
    // Precondition: register and login
    const user = getUser()
    await register.createUser(user)

    const loginResponse = await login.login({
      email: user.email,
      password: user.password,
    })
    const loginBody = await loginResponse.json()
    const token = loginBody.data.token

    // Attempt to create link with empty object
    const linkData = {}

    const response = await links.createLink(linkData, token)

    expect(response.status()).toBe(400)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty('message')
  })
})
