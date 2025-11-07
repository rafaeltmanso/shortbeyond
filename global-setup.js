const { cleanupTestData } = require('./playwright/config/database')

module.exports = async () => {
  console.log('Running pre-test cleanup...')
  await cleanupTestData()
  console.log('Environment ready for execution')
}
