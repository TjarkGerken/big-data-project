/**
 * This function is used to split an array into chunks of a specific size
 * @param {any[]} array - The input array to be chunked.
 * @param {number} chunkSize - The size of each chunk
 * @returns {any[][]} An array of arrays, each being a chunk of the input array.
 */
export function chunkArray(array: any[], chunkSize: number): any[][] {
  let index = 0;
  let arrayLength = array.length;
  let tempArray = [];

  for (index = 0; index < arrayLength; index += chunkSize) {
    let chunk = array.slice(index, index + chunkSize);
    tempArray.push(chunk);
  }
  return tempArray;
}
