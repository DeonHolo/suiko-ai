const pages = new Set(['stories', 'story', 'rules', 'archive', 'legal']);

export function readRoute() {
  const query = new URLSearchParams(window.location.search);
  const story = query.get('story');
  const page = query.get('page');
  return { page: pages.has(page) ? page : story ? 'story' : 'resume', story, task: query.get('task') };
}

export function href(page, id) {
  const query = new URLSearchParams();
  if (page === 'story' && id) query.set('story', id);
  else query.set('page', page);
  if (page === 'legal' && id) query.set('task', id);
  return './x_2236136_suiko_ai_review.do?' + query;
}

export function isNormalClick(event) {
  return event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
}

export function lastStory(viewer, id) {
  if (!viewer) return null;
  try {
    const key = 'suiko-last-story-' + viewer;
    if (id === undefined) return window.localStorage.getItem(key);
    if (id) window.localStorage.setItem(key, id);
    else window.localStorage.removeItem(key);
  } catch {
    // The workspace still works in browsers with storage disabled.
  }
  return null;
}
