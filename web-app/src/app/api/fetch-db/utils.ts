import { Md5 } from "ts-md5";

/**
 * Sleep for a given amount of time.
 * @param ms
 */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Convert a BigInt value to a Number value.
 * @param bigintValue
 */
function convertBigIntToNumber(bigintValue: bigint) {
  if (
    bigintValue < Number.MIN_SAFE_INTEGER ||
    bigintValue > Number.MAX_SAFE_INTEGER
  ) {
    throw new RangeError(
      "The BigInt value is out of the safe range for conversion to Number.",
    );
  }
  return Number(bigintValue);
}

/**
 * Replacer function for the JSON.stringify method to convert BigInt values to Number values.
 * Usage: JSON.stringify(obj, bigintReplacer)
 *  @param key of the JSON object
 * @param value of the JSON object
 */
export function bigintReplacer(key: string, value: any) {
  if (typeof value === "bigint") {
    return convertBigIntToNumber(value);
  } else {
    return value;
  }
}

/**
 * Compare two arrays if they are equal via the length or the Md5 Hash value of the Arrays.
 * @param arr1 Any given Array
 * @param arr2 Any given Array
 */
export function compareArrays(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }
  return (
    Md5.hashStr(JSON.stringify(arr1, bigintReplacer)) ===
    Md5.hashStr(JSON.stringify(arr2, bigintReplacer))
  );
}

/**
 * Fetch the url parameter for the get request and return the UID or a response if the UID is not provided.
 * @param request
 */
export function getUID(request: Request): string | Response {
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid");
  if (!uid) {
    return new Response("Please provide a uid", {
      status: 400,
    });
  }
  return uid;
}
