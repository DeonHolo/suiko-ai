import { visit } from 'jsonc-parser';
import { ReviewValidationError } from './assessment-checks.js';

export function parseProviderJson(raw) {
  if (typeof raw !== 'string') {
    throw new ReviewValidationError('INVALID_PROVIDER_JSON', 'The provider response must be JSON text.');
  }
  let bytes = 0;
  for (const character of raw) {
    const code = character.codePointAt(0);
    bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
    if (bytes > 262144) {
      throw new ReviewValidationError('INVALID_PROVIDER_JSON', 'The provider response exceeds the 256 KiB limit.');
    }
  }
  const objects = [];
  try {
    visit(raw, {
      onObjectBegin() { objects.push(new Set()); },
      onObjectProperty(property) {
        const keys = objects[objects.length - 1];
        if (keys.has(property)) throw new Error('Duplicate JSON key.');
        keys.add(property);
      },
      onObjectEnd() { objects.pop(); },
      onError() { throw new Error('Malformed JSON.'); },
    }, { disallowComments: true, allowTrailingComma: false, allowEmptyContent: false });
    return JSON.parse(raw);
  } catch {
    throw new ReviewValidationError('INVALID_PROVIDER_JSON', 'Gemini returned unreadable or ambiguous JSON. Your saved draft is available for a retry.');
  }
}
