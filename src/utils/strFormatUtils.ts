


export const showLastSixChars = (str: string): string => {
  const lastSix = str.slice(-6);
  return lastSix.padStart(6, '*');
}
