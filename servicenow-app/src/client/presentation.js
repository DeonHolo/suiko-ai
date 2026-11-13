const minuteFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
});
const minuteWithYear = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
});

export function localDateTime(value) {
  if (!value) return '';
  // ServiceNow's internal date strings are UTC. Preserve offsets on ISO dates.
  const utc = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) ? value.replace(' ', 'T') + 'Z' : value;
  const date = new Date(utc);
  if (Number.isNaN(date.valueOf())) return '';
  const format = date.getFullYear() === new Date().getFullYear() ? minuteFormat : minuteWithYear;
  return format.format(date).replace(' at ', ', ').replace(/\s+(AM|PM)$/, ' $1');
}

export const formats = { article: 'Article', script: 'Script', caption: 'Caption' };
export const kinds = { news: 'News', opinion: 'Opinion', sponsored: 'Sponsored' };
export const workflowLabels = {
  needs_review: 'Needs review', changes_requested: 'Changes requested', signed_off: 'Signed off',
  waiting_for_legal: 'With legal', ready_for_sign_off: 'Ready for sign-off',
};
