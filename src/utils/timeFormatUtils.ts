

export const canSignIn = (lastSignInTimestamp: number): boolean => {
  if (lastSignInTimestamp === undefined) {
    return true
  }
  if (lastSignInTimestamp === 0) {
    return  true
  }
  const currentTime = new Date();
  const lastSignInTime = new Date(lastSignInTimestamp);

  // 将时间转换为日期（忽略时间部分）
  const currentDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate()).getTime();
  const lastSignInDate = new Date(lastSignInTime.getFullYear(), lastSignInTime.getMonth(), lastSignInTime.getDate()).getTime();

  // 判断是否为第二天
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
  const differenceInMilliseconds = currentDate - lastSignInDate;

  return differenceInMilliseconds >= oneDayInMilliseconds;
}


export const formatDurationDHM = (ms: number): string => {
  if (ms === 0) {
    return '0d 0h 0min'
  }
  const diffTime = new Date().getTime() - ms
  console.log(diffTime)
  const seconds = Math.floor(diffTime / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;

  const parts: string[] = [];
  parts.push(`${days}d`)
  parts.push(`${remainingHours}h`)
  parts.push(`${remainingMinutes}min`)

  return parts.join(" ");
}

