// Firebase can't handle back slashes
export const createOrReverseFirebaseSafeUrl = (url: string, reverse?: boolean): string => {
  if (reverse) {
    const urlWithSlashes = url.replace(/~1/g,'/') // Revert to normal url
    return urlWithSlashes;
  }
  const removedProtocol = url.split('//').pop() as string;
  const replacedSlashes = removedProtocol.replace(/\//g,'~1');
  return replacedSlashes;
}

// Replace spaces with dashes and set lower case
export const convertToFriendlyUrlFormat = (stringWithSpaces: string): string => {
  return stringWithSpaces.split(' ').join('-').toLowerCase();
}

// Convert Hrs:Min:Sec string to milliseconds
export const convertHoursMinSecToMill = (hrsMinSecStamp: string): number => {
  
  const hrs: number = Number(hrsMinSecStamp.split(':')[0]);
  const min: number = Number(hrsMinSecStamp.split(':')[1]);
  const sec: number = Number(hrsMinSecStamp.split(':')[2]);

  return ((hrs*60*60 + min*60 + sec) * 1000);
}