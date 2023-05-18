import { APIURL } from './types'

export const deleteSend = async (id: string) => {
  try {
    const res = await fetch(`${APIURL}/send/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      },
    })
    if (!res.ok) {
      throw new Error(await res.json().then((data) => data.message))
    }
    return true
  } catch (error) {
    throw new Error(error)
  }
}
