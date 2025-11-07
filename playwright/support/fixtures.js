import { test as base, expect } from '@playwright/test'
import { registerService } from './services/auth.js'
import { loginService } from './services/auth.js'
import { linksService } from './services/links.js'
import { getUser } from './factories/user.js'

// Extends Playwright's base test with custom fixtures
export const test = base.extend({
  // Fixture: auth - Authentication service
  auth: async ({ request }, use) => {
    const register = registerService(request)
    const login = loginService(request)

    const getToken = async (user) => {
      const loginResponse = await login.login({
        email: user.email,
        password: user.password,
      })
      const loginBody = await loginResponse.json()
      return loginBody.data.token
    }

    await use({
      createUser: register.createUser,
      login: login.login,
      getToken,
    })
  },

  // Fixture: links - Links service
  links: async ({ request }, use) => {
    await use(linksService(request))
  },

  // Fixture: authenticatedUser - Ready-to-use authenticated user
  authenticatedUser: async ({ auth }, use) => {
    // 1. Arrange: Generate user data
    const user = getUser()

    // 2. Act: Create user AND get token
    await auth.createUser(user)
    const token = await auth.getToken(user)

    // 3. Use: Deliver the object with everything ready for the test
    await use({
      user,
      token,
    })

    // 4. Teardown (Optional): If we needed to delete the user
    // after the test, the code would go here.
  },
})

export { expect }
