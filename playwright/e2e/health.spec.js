// @ts-check
import { test, expect } from '../support/fixtures.js'

test('should verify if the API is online', async ({ request }) => {
  const response = await request.get('http://localhost:3333/health')

  // Expect a status code of 200
  expect(response.status()).toBe(200)

  const body = await response.json()
  expect(body.service).toBe('shortbeyond-api')
  expect(body.status).toBe('healthy')
})
