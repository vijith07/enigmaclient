export const convertToNaiveDateTime = (timeOption: string) => {
  const now = new Date()
  switch (timeOption) {
    case '1 hour':
      return new Date(now.setHours(now.getHours() + 1))
    case '1 day':
      return new Date(now.setDate(now.getDate() + 1))
    case '2 days':
      return new Date(now.setDate(now.getDate() + 2))
    case '3 days':
      return new Date(now.setDate(now.getDate() + 3))
    case '7 days':
      return new Date(now.setDate(now.getDate() + 7))
    case '30 days':
      return new Date(now.setDate(now.getDate() + 30))
    case 'Never':
        return new Date(now.setDate(now.getDate() + 365))
    default:
      return null
  }
}
