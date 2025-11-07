const { Client } = require('pg')
require('dotenv').config()

/**
 * Removes papito.dev test data so each run starts clean.
 */
async function cleanupTestData() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'dba',
    password: process.env.DB_PASS || 'dba',
    database: process.env.DB_NAME || 'ShortDB',
  })

  const emailPattern = '%@papito.dev'
  let transactionStarted = false

  try {
    await client.connect()
    await client.query('BEGIN')
    transactionStarted = true

    await client.query(
      `DELETE FROM links WHERE user_id IN (
         SELECT id FROM users WHERE email LIKE $1
       )`,
      [emailPattern]
    )

    await client.query('DELETE FROM users WHERE email LIKE $1', [emailPattern])

    await client.query('COMMIT')
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK').catch(() => undefined)
    }
    console.error('Failed to clean test data for papito.dev', error)
    throw error
  } finally {
    await client.end().catch(() => undefined)
  }
}

module.exports = { cleanupTestData }
