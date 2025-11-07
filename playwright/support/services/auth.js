export const registerService = (request) => {
  const createUser = async (user) => {
    return await request.post('/api/auth/register', {
      data: user,
    })
  }

  return {
    createUser,
  }
}

export const loginService = (request) => {
  const login = async (credentials) => {
    return await request.post('/api/auth/login', {
      data: credentials,
    })
  }

  return {
    login,
  }
}
