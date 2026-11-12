import React from 'react';

const labels = { read: 'Read', partial: 'Partly read', unavailable: 'Couldn’t read', not_read: 'Not read' };

export function hasSourceGaps(run) {
  return run?.request?.sources?.some(source => source.requested && source.status !== 'read');
}

export default function Sources({ sources }) {
  if (!sources?.length) return null;
  return <section className="card"><h3>Source material</h3>
    {sources.map(source => <article className="change source-card" key={source.source_id || source.url}>
      <h4>{source.title || 'Supplied link'}</h4>
      <p className="rule-status">{labels[source.status] || 'Not read'}</p>
      <p className="source-url">{source.passages?.length && /^https?:\/\//i.test(source.url)
        ? <a href={source.url} target="_blank" rel="noreferrer">{source.url}</a> : source.url}</p>
      {source.final_url && <p className="hint source-url">Opened {source.final_url}</p>}
      {source.retrieved_at && <p className="hint">{source.passages?.length ? 'Retrieved' : 'Tried'} {source.retrieved_at} UTC{source.reader ? ' via ' + source.reader : ''}</p>}
      {source.message && <p>{source.message}</p>}
      {source.status === 'not_read' && !source.message && <p>Saved as a reference for this review.</p>}
      {!!source.passages?.length && <details className="evidence">
        <summary>Read saved passages</summary>
        {source.passages.map(passage => <blockquote className="saved-source-text" key={passage.passage_id}>{passage.text}</blockquote>)}
      </details>}
    </article>)}
  </section>;
}
