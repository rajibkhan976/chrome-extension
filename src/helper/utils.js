export const utils = {
    truncateText: (text, count = 32) => (text.length > count ? text.slice(0, count) + "..." : text.slice(0, count)),
}