export const linksService = (request) => {
  const createLink = async (linkData, token) => {
    return await request.post('/api/links', {
      data: linkData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  const getLinks = async (token) => {
    return await request.get('/api/links', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  const createAndReturnLinkId = async (linkData, token) => {
    const response = await createLink(linkData, token)
    const body = await response.json()
    return body.data.id
  }

  const removeLink = async (linkId, token) => {
    return await request.delete(`/api/links/${linkId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  return {
    createLink,
    getLinks,
    createAndReturnLinkId,
    removeLink,
  }
}
