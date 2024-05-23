/**
 * TRUNCATE THE LONGER TEXT ADD ADDING 3... DOTS
 */
export const utils = {
  truncateText: (text, count = 27) => (text.length > count ? text.slice(0, count) + "..." : text.slice(0, count)),

  firstCharToLowerCase(str) {
    if (str.length === 0) return str; // Handle empty string
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
}