import React, { useEffect, useRef, useState } from 'react';
import { workspaceService } from './services/ReviewService';
import { formats, localDateTime, workflowLabels } from './presentation';
import { href, isNormalClick } from './routes';

export default function Stories({ stories, selected, canSearchAll, hasWorkflow, busy, onOpen, onNew, onSamples }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState({ items: [], next_cursor: null });
  const [loading, setLoading] = useState(canSearchAll);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const requestVersion = useRef(0);

  useEffect(() => {
    if (!canSearchAll) return;
    requestVersion.current++;
    let current = true;
    setLoading(true);
    setError('');
    const timer = setTimeout(async () => {
      try {
        const next = await workspaceService.stories({ search: search.trim(), status, cursor: '' });
        if (current) setPage(next);
      } catch (issue) {
        if (current) setError(issue.message);
      } finally {
        if (current) setLoading(false);
      }
    }, 180);
    return () => { current = false; requestVersion.current++; clearTimeout(timer); };
  }, [canSearchAll, search, status, refresh]);

  async function more() {
    const version = requestVersion.current;
    setLoading(true);
    setError('');
    try {
      const next = await workspaceService.stories({ search: search.trim(), status, cursor: page.next_cursor });
      if (version === requestVersion.current) setPage(previous => ({ items: [...previous.items, ...next.items], next_cursor: next.next_cursor }));
    } catch (issue) { if (version === requestVersion.current) setError(issue.message); }
    finally { if (version === requestVersion.current) setLoading(false); }
  }

  const items = canSearchAll ? page.items : stories.filter(story => story.title.toLowerCase().includes(search.trim().toLowerCase()));
  return <div className="list-page">
    <div className="page-heading">
      <h1>Stories</h1>
      <button className="primary" disabled={busy} onClick={onNew}>New story</button>
    </div>
    {selected && <div className="resume-bar"><span><strong>Continue working</strong> <span>{selected.title}</span></span>
      <button disabled={busy} onClick={() => onOpen(selected.id)}>Open story</button>
    </div>}
    <section className="surface records" aria-label="Saved stories">
      <div className="list-toolbar">
        <label>Find a story<input type="search" name="story-search" maxLength={160} value={search} disabled={busy} onChange={event => setSearch(event.target.value)} placeholder="Search by title…" /></label>
        {canSearchAll && hasWorkflow && <label>Status<select value={status} onChange={event => setStatus(event.target.value)}>
          <option value="">All stories</option>
          {Object.entries(workflowLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>}
      </div>
      {error && <p className="error" role="alert">{error} <button onClick={() => setRefresh(value => value + 1)}>Try again</button></p>}
      {loading && <p className="list-message" role="status">Finding stories…</p>}
      {!loading && !error && !items.length && <p className="list-message">{search || status ? 'No stories match. Try a different search.' : 'Your saved stories will appear here.'}</p>}
      {!!items.length && !loading && !error && <ul className="record-list">
        {items.map(story => <li key={story.id}>
          <a className="record-link" href={href('story', story.id)} onClick={event => {
            if (!isNormalClick(event)) return;
            event.preventDefault();
            if (!busy) onOpen(story.id);
          }}>
            <span className="record-info"><span className="record-name">{story.title}</span>
            <span className="record-meta">{[formats[story.content_format], story.version && 'Version ' + story.version, localDateTime(story.updated_at)].filter(Boolean).join(' · ')}</span>
            </span>
            {workflowLabels[story.status] && <span className="status-label">{workflowLabels[story.status]}</span>}
            <span className="record-arrow" aria-hidden="true">›</span>
          </a>
        </li>)}
      </ul>}
      {canSearchAll && page.next_cursor && !error && <div className="list-footer"><button disabled={loading} onClick={more}>Show more stories</button></div>}
    </section>
    <button className="quiet" disabled={busy} onClick={onSamples}>Try a sample story</button>
  </div>;
}
