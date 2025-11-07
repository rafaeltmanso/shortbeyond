import { faker } from '@faker-js/faker'

export const buildLink = () => ({
  original_url: faker.internet.url(),
  title: faker.lorem.words(3),
})

export const buildLinks = (count = 1) =>
  faker.helpers.multiple(buildLink, { count })

export const getLink = () => buildLink()
