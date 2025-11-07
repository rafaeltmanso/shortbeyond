import { test, expect } from '../../support/fixtures.js'

import { getUserWithLinks } from '../../support/factories/user.js'
import { registerService } from '../../support/services/auth.js'
import { loginService } from '../../support/services/auth.js'
import { linksService } from '../../support/services/links.js'

test.describe('GET /links - Get list of links', () => {
  let register
  let login
  let links

  test.beforeEach(async ({ request }) => {
    register = registerService(request)
    login = loginService(request)
    links = linksService(request)
  })

  test('should return a list of pre-shortened links', async ({ request }) => {
    // Preparation: user with 5 links
    const userData = getUserWithLinks(5)
    await register.createUser(userData.user)

    const loginResponse = await login.login({
      email: userData.user.email,
      password: userData.user.password,
    })
    const loginBody = await loginResponse.json()
    const token = loginBody.data.token

    // Pre-register each of the 5 links
    for (const link of userData.links) {
      await links.createLink(link, token)
    }

    // Execution: get the list of links
    const response = await links.getLinks(token)
    const body = await response.json()

    // Validations
    expect(response.status()).toBe(200)
    expect(body.message).toBe('Links Encurtados')
    expect(body.count).toBe(userData.links.length)
    expect(Array.isArray(body.data)).toBe(true)

    // Validation of each link content
    for (const [index, link] of body.data.entries()) {
      expect(link).toHaveProperty('id')
      expect(link).toHaveProperty('original_url')
      expect(link).toHaveProperty('short_code')
      expect(link).toHaveProperty('title')
      expect(link.short_code).toMatch(/^[a-zA-Z0-9]{5}$/)
      expect(link.original_url).toBe(userData.links[index].original_url)
    }
  })

  test('should return an empty list for new user', async ({ request }) => {
    // Preparation: user without links
    const userData = getUserWithLinks(0)
    await register.createUser(userData.user)

    const loginResponse = await login.login({
      email: userData.user.email,
      password: userData.user.password,
    })
    const loginBody = await loginResponse.json()
    const token = loginBody.data.token

    // Execution and validation
    const response = await links.getLinks(token)
    const body = await response.json()

    expect(response.status()).toBe(200)
    expect(body.count).toBe(0)
    expect(body.data).toEqual([])
  })

  test('should return 401 when attempting to list links without authentication token', async ({
    request,
  }) => {
    // Preparation: empty token (missing)
    const invalidToken = ''

    // Execution: attempt to access without authentication
    const response = await links.getLinks(invalidToken)
    const body = await response.json()

    // Validation
    expect(response.status()).toBe(401)
    expect(body.message).toBe('Use o formato: Bearer <token>')
    expect(body).not.toHaveProperty('count')
    expect(body).not.toHaveProperty('data')
  })

  test('should return 401 when using an invalid token', async ({ request }) => {
    // Preparation: token with invalid format
    const invalidToken = 'este.token.nao.e.valido.e.vai.falhar.na.verificacao'

    // Execution: attempt to access with invalid token
    const response = await links.getLinks(invalidToken)
    const body = await response.json()

    // Validation
    expect(response.status()).toBe(401)
    expect(body.message).toBe(
      'token is malformed: token contains an invalid number of segments'
    )
    expect(body).not.toHaveProperty('count')
  })
})
