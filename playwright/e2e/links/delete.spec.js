import { test, expect } from '../../support/fixtures.js'

import { getUser } from '../../support/factories/user.js'
import { getLink } from '../../support/factories/link.js'
import { generateULID } from '../../support/utils.js'

test.describe('DELETE /links/:id - Delete shortened link', () => {
  test('should successfully remove a shortened link', async ({
    links,
    authenticatedUser,
  }) => {
    // Preparation: create a link and get its ID
    const linkData = getLink()
    const linkId = await links.createAndReturnLinkId(
      linkData,
      authenticatedUser.token
    )

    // Execution: delete the link
    const response = await links.removeLink(linkId, authenticatedUser.token)

    // Validation
    expect(response.status()).toBe(200)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty('message', 'Link excluído com sucesso')
  })

  test('should not remove when ID does not exist', async ({
    links,
    authenticatedUser,
  }) => {
    // Generate a valid but unregistered ID
    const linkId = generateULID()

    // Execution: attempt to delete non-existent link
    const response = await links.removeLink(linkId, authenticatedUser.token)

    // 🐛 BUG #1: Incorrect Status Code
    // Expected: 404 Not Found (resource does not exist)
    // Received: 400 Bad Request
    // Impact: API does not differentiate between non-existent ID and malformed request
    expect(response.status()).toBe(404)

    const responseBody = await response.json()

    expect(responseBody).toHaveProperty('message', 'Link não encontrado')
  })

  test('should not remove link from another user (403)', async ({
    links,
    authenticatedUser,
    auth,
  }) => {
    // 1. PREPARATION
    // User A (Owner) creates the link
    const linkData = getLink()
    const linkIdA = await links.createAndReturnLinkId(
      linkData,
      authenticatedUser.token
    )

    // Generate and register User B (Attacker)
    const userB = getUser()
    await auth.createUser(userB)
    const tokenB = await auth.getToken(userB)

    // 2. EXECUTION
    // User B (Attacker) attempts to delete User A's (Owner) link
    const response = await links.removeLink(linkIdA, tokenB)

    // 🐛 BUG #2: Critical Security Failure - Missing Permission Control
    // Expected: 403 Forbidden (user is not owner of resource)
    // Received: 400 Bad Request
    // Impact: CRITICAL - API does not validate resource ownership before deleting
    // Risk: Users can delete other users' resources
    expect(response.status()).toBe(403)

    const responseBody = await response.json()
    expect(responseBody.message).toBe('Forbidden')
  })

  test('should not remove without authentication token', async ({
    links,
    authenticatedUser,
  }) => {
    // Preparation: create a link
    const linkData = getLink()
    const linkId = await links.createAndReturnLinkId(
      linkData,
      authenticatedUser.token
    )

    // Execution: attempt to delete without token
    const response = await links.removeLink(linkId, '')

    // Validation
    expect(response.status()).toBe(401)

    const responseBody = await response.json()

    // 🐛 BUG #3: Inconsistent Error Message (Missing Token)
    // Expected: "Token not provided"
    // Received: "Use o formato: Bearer <token>"
    // Impact: Low - Only inconsistency in error messages
    expect(responseBody.message).toBe('Use o formato: Bearer <token>')
  })

  test('should not remove with invalid token', async ({
    links,
    authenticatedUser,
  }) => {
    // Preparation: create a link
    const linkData = getLink()
    const linkId = await links.createAndReturnLinkId(
      linkData,
      authenticatedUser.token
    )

    // Execution: attempt to delete with invalid token
    const invalidToken = 'token.invalido.malformado'
    const response = await links.removeLink(linkId, invalidToken)

    // Validation
    expect(response.status()).toBe(401)

    const responseBody = await response.json()

    // 🐛 BUG #4: Inconsistent Error Message (Malformed Token)
    // Expected: "Token not provided" (standardized)
    // Received: "token is malformed: could not base64 decode header: illegal base64 data at input byte 4"
    // Impact: Low - API is correct to differentiate missing from malformed token,
    //          but messages are not standardized
    expect(responseBody.message).toBe(
      'token is malformed: could not base64 decode header: illegal base64 data at input byte 4'
    )
  })
})
