

export const numberFormatToEnglish = (num: number, digit = 2) => {
  if (!num) {
    return 0
  }
  return num.toLocaleString('en-US',  {
    minimumFractionDigits: 2,
    maximumFractionDigits: digit,
  })
}
