import { GlideDateTime, GlideDigest } from '@servicenow/glide';
import { RESTMessageV2 } from '@servicenow/glide/sn_ws';
import { collectSourceEvidence } from './generated/source-reader.js';

const readerEndpoint = 'https://r.jina.ai/';

function read(url, timeout) {
  const request = new RESTMessageV2();
  request.setEndpoint(readerEndpoint);
  request.setAllowedRedirectURIs([readerEndpoint]);
  request.setHttpMethod('POST');
  request.setHttpTimeout(timeout);
  request.setRequestHeader('Accept', 'application/json');
  request.setRequestHeader('Content-Type', 'application/json');
  request.setRequestHeader('X-Respond-With', 'text');
  request.setRequestHeader('X-Retain-Images', 'none');
  request.setRequestHeader('X-No-Cache', 'true');
  request.setRequestHeader('X-Timeout', String(Math.max(1, Math.floor(timeout / 1000) - 1)));
  request.setRequestBody(JSON.stringify({ url }));
  const response = request.execute();
  return { status: response.getStatusCode(), body: response.getBody() };
}

export function readSavedSources(urls, needed, readPage = read) {
  return collectSourceEvidence(urls, {
    needed, read: readPage, milliseconds: () => Date.now(),
    timestamp: () => String(new GlideDateTime().getValue()),
    hash: text => String(new GlideDigest().getSHA256Hex(text)),
  }).map(source => source.retrieved_at ? { ...source, reader: 'Jina Reader' } : source);
}
