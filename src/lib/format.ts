const dateTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});
const dateOnly = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** Always UTC so server and client render the same text. */
export const formatDateTime = (d: Date) => `${dateTime.format(d)} UTC`;
export const formatDate = (d: Date) => dateOnly.format(d);
