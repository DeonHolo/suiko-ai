import { ReviewValidationError } from './assessment-checks.js';

export const contentFormats = ['article', 'script', 'caption'];
export const contentKinds = ['news', 'opinion', 'sponsored'];

function invalid(message) {
  throw new ReviewValidationError('INVALID_STORY_INPUT', message);
}

export function normalizeSourceUrls(values) {
  if (!Array.isArray(values) || values.some(value => typeof value !== 'string')) {
    invalid('Enter source links as a list of text URLs.');
  }
  const urls = [];
  for (const value of values) {
    let url = value.trim();
    if (!url) continue;
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) url = 'https://' + url;
    if (url.length > 1500 || /[\s\\\u0000-\u001f\u007f]/.test(url)) invalid('Use public http or https source links without spaces or backslashes.');
    const match = url.match(/^(https?):\/\/([^/?#]+)([^#]*)(?:#(.*))?$/i);
    if (!match || match[2].includes('@')) invalid('Use public http or https source links without embedded login details.');
    const authority = match[2].split(':');
    const host = authority[0].toLowerCase().replace(/\.$/, '');
    const labels = host.split('.');
    if (authority.length > 2 || (authority.length === 2 && !/^(?:80|443)$/.test(authority[1]))
        || labels.length < 2 || labels.some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))
        || /^\d+(?:\.\d+){3}$/.test(host)
        || ['localhost', 'local', 'internal'].some(suffix => host === suffix || host.endsWith('.' + suffix))) {
      invalid('Use a public website address. Local addresses, IP addresses and custom ports are not supported.');
    }
    if (/[?&#](?:access_token|api[_-]?key|token|password|secret|signature|sig|authorization)=/i.test(match[3] + '#' + (match[4] || ''))) {
      invalid('This source link appears to contain private access information. Use a public link or provide a source excerpt in review context.');
    }
    const protocol = match[1].toLowerCase();
    const defaultPort = (protocol === 'https' && authority[1] === '443') || (protocol === 'http' && authority[1] === '80');
    url = protocol + '://' + host + (authority[1] && !defaultPort ? ':' + authority[1] : '')
      + (match[3] || '/') + (match[4] !== undefined ? '#' + match[4] : '');
    if (!urls.includes(url)) urls.push(url);
    if (urls.length > 5) invalid('Use up to five different source links for one version.');
  }
  return urls;
}

export function normalizeStoryInput(input) {
  if (!input || typeof input.title !== 'string' || typeof input.text !== 'string'
      || (input.notes !== undefined && typeof input.notes !== 'string')) invalid('Enter the title, draft and optional review context as text.');
  if (!contentFormats.includes(input.content_format) || !contentKinds.includes(input.content_kind)) {
    invalid('Choose the content format and kind before saving this version.');
  }
  const normalize = text => text.replace(/\r\n?/g, '\n').trim();
  const title = normalize(input.title);
  const text = normalize(input.text);
  const notes = normalize(input.notes || '');
  const sourceUrls = normalizeSourceUrls(input.source_urls === undefined ? [] : input.source_urls);
  if (JSON.stringify(sourceUrls).length > 8000) invalid('Use shorter source links or fewer links for one version.');
  const total = [...title + text + notes + sourceUrls.join('\n')].length;
  if (!title || [...title].length > 160 || !text || [...notes].length > 4000 || total > 12000) {
    invalid('Enter a title and draft. Use up to 160 title characters, 4,000 context characters and 12,000 characters in total, including source links.');
  }
  return { title, text, notes, content_format: input.content_format, content_kind: input.content_kind, source_urls: sourceUrls };
}

export function storySnapshot(revision) {
  if (!revision) return null;
  const segments = [{ segment_id: 'title', field: 'title', text: revision.title }];
  const sources = Array.isArray(revision.source_urls) ? revision.source_urls : [];
  for (const [field, value] of [['body', revision.text], ['production_notes', revision.notes || ''], ['source_notes', sources.join('\n')]]) {
    String(value).split(/\n\s*\n/).filter(part => part.trim()).forEach((text, index) => {
      segments.push({ segment_id: field + '-' + (index + 1), field, text });
    });
  }
  const classified = contentFormats.includes(revision.content_format) && contentKinds.includes(revision.content_kind);
  return {
    revision_id: 'draft-' + revision.version, segments,
    ...(classified ? { content_format: revision.content_format, content_kind: revision.content_kind, source_urls: [...sources] } : {}),
  };
}
