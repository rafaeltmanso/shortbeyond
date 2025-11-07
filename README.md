# ShortBeyond - API Test Automation Suite

[![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Podman](https://img.shields.io/badge/Podman-892CA0?style=for-the-badge&logo=podman&logoColor=white)](https://podman.io/)
[![Faker.js](https://img.shields.io/badge/Faker.js-FF6C37?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnoiIGZpbGw9IndoaXRlIi8+PC9zdmc+&logoColor=white)](https://fakerjs.dev/)

A comprehensive Playwright-based API testing suite for the **ShortBeyond** URL shortener service. This project demonstrates professional test automation practices including custom fixtures, data factories, and robust test architecture.

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Test Patterns](#test-patterns)
- [API Endpoints](#api-endpoints)
- [Test Results](#test-results)
- [Contributing](#contributing)
- [Credits](#credits)

## 🎯 About the Project

ShortBeyond is a URL shortening service that provides a REST API for creating, managing, and tracking shortened links. This test automation suite validates the API's functionality through comprehensive regression tests covering:

- **Authentication**: User registration and login flows
- **Link Management**: Creating, retrieving, and deleting shortened links
- **Authorization**: Token-based authentication and access control
- **Health Checks**: Service availability monitoring

## 🛠️ Technology Stack

- **[Playwright](https://playwright.dev/)** - Modern end-to-end testing framework
- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **[Faker.js](https://fakerjs.dev/)** - Test data generation
- **[PostgreSQL](https://www.postgresql.org/)** - Database (via Podman)
- **[Podman](https://podman.io/)** - Containerized infrastructure

## 🏗️ Architecture

### Infrastructure

The application runs in a containerized environment defined in `shortbeyond.yaml`:

- **PostgreSQL Database** - Port 5432 (dba/dba credentials)
- **Adminer** - Port 8080 (Database management UI)
- **ShortBeyond API** - Port 3333 (Main API service)
- **Web Frontend** - Port 80 (Optional UI)

### Test Architecture

The test suite follows a layered architecture pattern:

```
playwright/
├── config/          # Database utilities and configuration
├── e2e/             # Test specifications organized by domain
│   ├── auth/        # Authentication tests
│   ├── links/       # Link management tests
│   └── health.spec.js
├── support/
│   ├── fixtures.js  # Custom Playwright fixtures
│   ├── factories/   # Test data generators
│   ├── services/    # API service wrappers
│   └── utils.js     # Utility functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Podman and Podman Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shortbeyond
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the infrastructure**
   ```bash
   # Start all containers (API, Database, Adminer, Web)
   podman-compose -f shortbeyond.yaml up -d
   ```

4. **Configure environment variables**
   
   The `.env` file contains the necessary configuration:
   ```env
   BASE_API=http://localhost:3333
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=dba
   DB_PASS=dba
   DB_NAME=ShortDB
   ```

## 🧪 Running Tests

### Execute All Tests
```bash
npx playwright test
```

### Run Specific Test Suite
```bash
# Authentication tests
npx playwright test playwright/e2e/auth

# Links tests
npx playwright test playwright/e2e/links

# Health check
npx playwright test playwright/e2e/health.spec.js
```

### View Test Report
```bash
npx playwright show-report
```

### Debug Mode
```bash
npx playwright test --debug
```

## 📁 Project Structure

```
shortbeyond/
├── .env                          # Environment configuration
├── .github/
│   └── copilot-instructions.md   # AI coding assistant guide
├── global-setup.js               # Pre-test database cleanup
├── playwright.config.js          # Playwright configuration
├── shortbeyond.yaml              # Podman infrastructure definition
└── playwright/
    ├── config/
    │   └── database.js           # Database cleanup utilities
    ├── e2e/
    │   ├── auth/
    │   │   ├── login.spec.js     # Login endpoint tests
    │   │   └── register.spec.js  # Registration endpoint tests
    │   ├── links/
    │   │   ├── delete.spec.js    # Delete link tests
    │   │   ├── get.spec.js       # Get links tests
    │   │   └── links.spec.js     # Create link tests
    │   └── health.spec.js        # Health check tests
    └── support/
        ├── fixtures.js           # Custom Playwright fixtures
        ├── utils.js              # ULID generator and utilities
        ├── factories/
        │   ├── link.js           # Link data factory
        │   └── user.js           # User data factory
        └── services/
            ├── auth.js           # Authentication service
            └── links.js          # Links service
```

## 🎨 Test Patterns

### Custom Fixtures

The project uses custom Playwright fixtures to enhance test readability and maintainability:

```javascript
// Using the authenticatedUser fixture
test('should create a link', async ({ links, authenticatedUser }) => {
  const linkData = getLink()
  const response = await links.createLink(linkData, authenticatedUser.token)
  expect(response.status()).toBe(201)
})
```

### Service Layer Pattern

API calls are abstracted into service functions:

```javascript
// playwright/support/services/auth.js
export const registerService = (request) => {
  const createUser = async (user) => {
    return await request.post('/api/auth/register', { data: user })
  }
  return { createUser }
}
```

### Data Factory Pattern

Test data is generated using Faker.js for consistency:

```javascript
// playwright/support/factories/user.js
export const getUser = () => ({
  name: faker.person.fullName(),
  email: faker.internet.email({ provider: 'papito.dev' }),
  password: faker.internet.password(),
})
```

### Database Cleanup

The suite includes automatic cleanup of test data before each run:

- All users with `@papito.dev` email domain are removed
- Associated links are cascade-deleted
- Ensures clean test environment for every execution

## 🔌 API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | Authenticate and get JWT token |

### Links Management

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/links` | POST | Create shortened link | ✅ |
| `/api/links` | GET | List user's links | ✅ |
| `/api/links/:id` | DELETE | Delete a link | ✅ |

### Health Check

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Check API status |

## 📊 Test Results

The complete test suite has been executed with detailed findings documented in the **[Test Execution Report](TEST_REPORT.md)**.

### Summary

- **Total Tests:** 24
- **Passed:** 22 (91.67%)
- **Failed:** 2 (8.33%)
- **Status:** ⚠️ Two bugs identified requiring attention

### Key Findings

1. **Bug #1 - Incorrect HTTP Status Code (Medium Severity)**
   - DELETE endpoint returns `400` instead of `404` for non-existent resources
   - Impact: API semantics and error handling inconsistency

2. **Bug #2 - Missing Authorization Control (CRITICAL Severity)**
   - Users can delete other users' links (security vulnerability)
   - Impact: Broken access control, data integrity risk
   - Classification: OWASP A01:2021 - Broken Access Control

For detailed information including reproduction steps, security analysis, and recommendations, see the **[complete test report](TEST_REPORT.md)**.

## 🤝 Contributing

This is a learning project for demonstration purposes. However, suggestions and improvements are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Credits

### API Development

**[Fernando Papito](https://github.com/papitodev)** - Creator and developer of the ShortBeyond API. This project was made possible thanks to his excellent teaching methodology and dedication to sharing knowledge in test automation and software quality.

Fernando is a renowned specialist in test automation and quality engineering in Brazil, known for his practical approach to teaching and his commitment to the QA community.

### Test Automation Suite

This test automation suite was developed by **Rafael Manso** as part of a comprehensive training bootcamp conducted by Fernando Papito. The project demonstrates the application of professional test automation practices, architectural patterns, and best practices learned throughout the course.

---

## 📚 Learning Resources

For more content on test automation and quality engineering, check out Fernando Papito's work:
- **GitHub**: [@papitodev](https://github.com/papitodev)

---

**Note**: This is a study project developed for educational purposes as part of a professional training bootcamp. The goal is to demonstrate proficiency in API test automation using modern tools and industry best practices.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for learning and growth in software quality engineering**
# shortbeyond-api-testing
