import React from 'react';
import { localDateTime } from './presentation';

const labels = { read: 'Source text retrieved', partial: 'Some source text retrieved', unavailable: 'Couldn’t retrieve source text', not_read: 'Source text not retrieved' };

export function hasSourceGaps(run) {
  return run?.request?.sources?.some(source => source.requested && source.status !== 'read');
}

export default function Sources({ sources }) {
  if (!sources?.length) return null;
  return <section className="card" id="review-sources"><h3>Sources used</h3>
    {sources.map(source => <article className="change source-card" key={source.source_id || source.url}>
      <h4>{source.title || 'Source link'}</h4>
      <p className="rule-status">{labels[source.status] || 'Source text not retrieved'}</p>
      <p className="source-url">{source.passages?.length && /^https?:\/\//i.test(source.url)
        ? <a href={source.url} target="_blank" rel="noreferrer">{source.url}</a> : source.url}</p>
      {source.retrieved_at && <p className="hint">{source.passages?.length ? 'Retrieved' : 'Attempted'} {localDateTime(source.retrieved_at)}</p>}
      {source.cached && <p className="hint">This is a saved copy. Open the source link for updates.</p>}
      {source.message && <p>{source.message}</p>}
      {source.status === 'not_read' && !source.message && <p>Saved as a reference for this review.</p>}
      {!!source.passages?.length && <details className="evidence">
        <summary>View saved passages</summary>
        {source.passages.map(passage => <blockquote className="saved-source-text" key={passage.passage_id}>{passage.text}</blockquote>)}
      </details>}
    </article>)}
  </section>;
}
