import { faker } from '@faker-js/faker'
import { buildLinks } from './link.js'

const buildUser = () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()

  return {
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({
      firstName,
      lastName,
      provider: 'papito.dev',
    }),
    password: faker.internet.password(),
  }
}

export const getUser = () => buildUser()

export const getUserWithLinks = (linksCount = 1) => ({
  user: buildUser(),
  links: buildLinks(linksCount),
})
