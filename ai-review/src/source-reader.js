import { normalizeSourceUrls } from './story-input.js';
import { ruleApplicability } from './editorial-rules.js';

export const readerLimits = { text: 6000, response: 750000, perLinkMs: 7000, batchMs: 18000 };

export function sourceRuleIds(rules, candidate) {
  return rules.filter(rule => rule.active && rule.approved?.definition?.requires_sources
    && ruleApplicability(rule.approved.definition, candidate).applies === true).map(rule => rule.rule_id);
}

export function needsPublicSources(rules, candidate) {
  return sourceRuleIds(rules, candidate).length > 0;
}

export function sourceMaterial(sources) {
  return sources.map(({ source_id, url, status, passages }) => ({ source_id, url, status, passages: passages || [] }));
}

export function publicReaderUrl(value) {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) return null;
  try {
    const [url] = normalizeSourceUrls([value]);
    const authority = url.match(/^https?:\/\/([^/?#]+)/)[1];
    if (authority.includes(':') || /(?:\.(?:intranet|corp|test|invalid|home\.arpa)|\.[0-9]+)$/i.test(authority)) return null;
    const params = url.split(/[?#]/).slice(1).flatMap(part => part.split('&'));
    for (const param of params) {
      const key = decodeURIComponent(param.split('=')[0]);
      if (/^(?:access[_-]?token|api[_-]?key|token|password|secret|sig(?:nature)?|authorization|x-(?:amz|goog)-(?:signature|credential|security-token))$/i.test(key)) return null;
    }
    return url;
  } catch {
    return null;
  }
}

const unavailable = (message, status = null) => ({ status: 'unavailable', message, ...(status ? { http_status: status } : {}) });

const cleanText = text => text.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
  .replace(/[\ud800-\udfff]/gu, '\ufffd').trim();

function sourcePassages(text) {
  const passages = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + 1500, text.length);
    if (end < text.length) {
      const paragraph = text.lastIndexOf('\n\n', end);
      const space = text.lastIndexOf(' ', end);
      if (paragraph > start + 750) end = paragraph;
      else if (space > start + 750) end = space;
      if (/[\ud800-\udbff]/.test(text[end - 1])) end--;
    }
    const passage = text.slice(start, end).trim();
    if (passage) passages.push({ passage_id: 'passage-' + (passages.length + 1), text: passage });
    start = end;
  }
  return passages;
}

function decodeReaderReply(response, url, hash) {
  if (response.status === 429) return unavailable('The source reader is busy. Try again or paste the relevant excerpt.');
  if (response.status !== 200) return unavailable('The source reader could not open this link. Try again or paste an excerpt.');
  if (typeof response.body !== 'string' || response.body.length > readerLimits.response) {
    return unavailable('The reader returned more material than this review can use. Paste the relevant excerpt.');
  }
  let data;
  try { data = JSON.parse(response.body)?.data; }
  catch { return unavailable('The source reader did not return readable text. Paste the relevant excerpt.'); }
  const status = data?.httpStatus;
  if (!Number.isInteger(status) || status < 200 || status >= 300) {
    return unavailable('The original page could not be opened. Paste the relevant excerpt.', Number.isInteger(status) ? status : null);
  }
  const finalUrl = publicReaderUrl(data.finalUrl || data.url);
  if (!finalUrl) return unavailable('The link led to an address Suiko cannot use. Paste the relevant excerpt.', status);
  if (typeof data.warning === 'string' && /captcha|log\s?in|sign\s?in|paywall|access denied|authentication/i.test(data.warning)) {
    return unavailable('The page requires access Suiko does not have. Paste the relevant excerpt.', status);
  }
  const text = typeof data.text === 'string' ? cleanText(data.text) : '';
  if (!text) return unavailable('The link returned no readable text. Paste the relevant excerpt.', status);
  const clipped = text.length > readerLimits.text;
  let retained = text.slice(0, readerLimits.text);
  if (/[\ud800-\udbff]$/.test(retained)) retained = retained.slice(0, -1);
  const passages = sourcePassages(retained);
  const partial = clipped || status === 206 || Boolean(data.warning);
  return {
    status: partial ? 'partial' : 'read', http_status: status, passages,
    title: typeof data.title === 'string' ? cleanText(data.title).slice(0, 160) : '',
    ...(finalUrl === url ? {} : { final_url: finalUrl }),
    fingerprint: hash(JSON.stringify(passages)),
    ...(partial ? { message: clipped ? 'Suiko kept the first 6,000 characters. Paste another excerpt if you need more.'
      : 'The reader reported that some text may be missing. Check the original or paste an excerpt.' } : {}),
  };
}

export function collectSourceEvidence(urls, { needed, read, milliseconds, timestamp, hash }) {
  const deadline = milliseconds() + readerLimits.batchMs;
  return urls.slice(0, 5).map((url, index) => {
    const item = { source_id: 'source-' + (index + 1), url, requested: needed };
    if (!needed) return { ...item, status: 'not_read', message: 'No applicable approved rule asked for source material.' };
    const target = publicReaderUrl(url);
    if (!target) return { ...item, ...unavailable('Use a public link without access details, or paste the relevant excerpt.') };
    const started = milliseconds();
    const remaining = deadline - started;
    if (remaining < 1000) return { ...item, status: 'not_read', message: 'Suiko ran out of time to open this link. Try again or paste an excerpt.' };
    let result;
    try { result = decodeReaderReply(read(target, Math.min(remaining, readerLimits.perLinkMs)), target, hash); }
    catch { result = unavailable('Suiko could not finish reading this link. Try again or paste an excerpt.'); }
    return { ...item, ...result, retrieved_at: timestamp(), elapsed_ms: Math.max(0, milliseconds() - started) };
  });
}
