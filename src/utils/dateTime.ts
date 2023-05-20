export const convertToNaiveDateTime = (timeOption: string) => {
  console.log('timeOption', timeOption)
  const now = new Date()
  switch (timeOption) {
    case '1 hour':
      return new Date(now.setHours(now.getHours() + 1)).toJSON()
    case '1 day':
      return new Date(now.setDate(now.getDate() + 1)).toJSON()
    case '2 days':
      return new Date(now.setDate(now.getDate() + 2)).toJSON()
    case '3 days':
      return new Date(now.setDate(now.getDate() + 3)).toJSON()
    case '7 days':
      return new Date(now.setDate(now.getDate() + 7)).toJSON()
    case '30 days':
      return new Date(now.setDate(now.getDate() + 30)).toJSON()
    case 'Never':
      return new Date('9999-12-31T23:59:59.999Z').toJSON()
    default:
      return timeOption
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

export const convertDateTimeToReadable = (datetime: string) : string => {
  const date = new Date(datetime)
  return date.toLocaleString()
}
