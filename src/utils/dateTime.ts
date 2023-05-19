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

// convert seconds to days, hours, minutes, seconds  readable format
export const convertSecondsToDHMS = (seconds: number) : string => {
  const days = Math.floor(seconds / (3600*24));
  const hours = Math.floor(seconds % (3600*24) / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const secondsLeft = Math.floor(seconds % 60);
  if(days > 0) {
    return days + " days, " + hours + " hours, " + minutes + " minutes, " + secondsLeft + " seconds";
  }
  else if(hours > 0) {
    return hours + " hours, " + minutes + " minutes, " + secondsLeft + " seconds";
  }
  else if(minutes > 0) {
    return minutes + " minutes, " + secondsLeft + " seconds";
  }
  else {
    return secondsLeft + " seconds";
  }
}
