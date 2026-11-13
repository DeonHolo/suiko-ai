import { diffWordsWithSpace } from 'diff';

const visibleFields = ['title', 'body', 'caption', 'production_notes', 'source_notes'];
const pieceLimit = 24;

function joined(revision, field) {
  return revision.segments.filter(segment => segment.field === field).map(segment => segment.text).join('\n\n');
}

export function literalChanges(baseline, candidate) {
  if (!baseline) return null;
  const changes = [];
  for (const field of visibleFields) {
    const before = joined(baseline, field);
    const after = joined(candidate, field);
    if (before === after) continue;
    const parts = diffWordsWithSpace(before, after, { maxEditLength: 2500, timeout: 150 });
    if (!parts) {
      changes.push({ field, before: before.slice(0, 500), after: after.slice(0, 500), limited: true });
      continue;
    }
    let beforeOffset = 0;
    let afterOffset = 0;
    for (let index = 0; index < parts.length; index++) {
      const part = parts[index];
      if (!part.added && !part.removed) {
        beforeOffset += part.value.length;
        afterOffset += part.value.length;
        continue;
      }
      let removed = '';
      let added = '';
      const start = index;
      while (index < parts.length && (parts[index].added || parts[index].removed)) {
        if (parts[index].added) added += parts[index].value;
        else removed += parts[index].value;
        index++;
      }
      const left = start > 0 ? parts[start - 1].value.slice(-100) : '';
      const right = index < parts.length ? parts[index].value.slice(0, 100) : '';
      changes.push({ field, before: removed.slice(0, 500), after: added.slice(0, 500), left, right,
        before_offset: beforeOffset, after_offset: afterOffset,
        ...(removed.length > 500 || added.length > 500 ? { limited: true } : {}) });
      beforeOffset += removed.length;
      afterOffset += added.length;
      if (changes.length >= pieceLimit) return { changes, limited: true };
      index--;
    }
  }
  return { changes, limited: changes.some(change => change.limited) };
}

function locate(revision, reference) {
  const segment = revision.segments.find(segment => segment.segment_id === reference.segment_id);
  if (!segment || !reference.quote) return { field: null, positions: [] };
  let offset = 0;
  for (const other of revision.segments) {
    if (other === segment) break;
    if (other.field === segment.field) offset += other.text.length + 2;
  }
  const positions = [];
  for (let index = segment.text.indexOf(reference.quote); index >= 0; index = segment.text.indexOf(reference.quote, index + 1)) {
    positions.push([offset + index, offset + index + reference.quote.length]);
  }
  return { field: segment.field, positions };
}

function touches(position, edit, side) {
  const start = edit[side + '_offset'];
  const length = edit[side].length;
  return position.positions.some(([from, to]) => length ? from < start + length && to > start : from <= start && to >= start);
}

function retainedLength(before, after) {
  const parts = diffWordsWithSpace(before, after, { maxEditLength: 2500, timeout: 150 });
  if (!parts) return null;
  return parts.filter(part => !part.added && !part.removed)
    .reduce((total, part) => total + part.value.replace(/\s/g, '').length, 0);
}

function containsOnlyEditedText(quote, revision, other) {
  const text = joined(revision, quote.field);
  const opposite = joined(other, quote.field);
  const retained = retainedLength(text, opposite);
  if (retained === null) return false;
  // Removing a one-sided quote must preserve the text matched to the other
  // version. Recomputing lets shared words align with their retained occurrence.
  return quote.positions.some(([from, to]) => {
    const remaining = retainedLength(text.slice(0, from) + text.slice(to), opposite);
    return remaining !== null && remaining >= retained;
  });
}

export function unrepresentedChanges(changes, baseline, candidate, diff) {
  const before = changes.flatMap(change => change.before).map(reference => locate(baseline, reference))
    .filter(reference => reference.positions.length === 1);
  const after = changes.flatMap(change => change.after).map(reference => locate(candidate, reference))
    .filter(reference => reference.positions.length === 1);
  return diff.changes.filter(edit =>
    (edit.before.length && !before.some(quote => quote.field === edit.field && touches(quote, edit, 'before')))
    || (edit.after.length && !after.some(quote => quote.field === edit.field && touches(quote, edit, 'after'))));
}

export function fitsLiteralEdit(change, baseline, candidate, diff) {
  if (!diff?.changes.length || change.kind === 'formatting') return false;
  const before = change.before.map(reference => ({ ...locate(baseline, reference), quote: reference.quote }));
  const after = change.after.map(reference => ({ ...locate(candidate, reference), quote: reference.quote }));
  const touchesSide = (quote, side) => diff.changes.some(edit => edit.field === quote.field && edit[side].length && touches(quote, edit, side));
  if (change.kind === 'removed') return before.every(quote => touchesSide(quote, 'before')
    && !joined(candidate, quote.field).includes(quote.quote) && containsOnlyEditedText(quote, baseline, candidate));
  if (change.kind === 'added') return after.every(quote => touchesSide(quote, 'after')
    && !joined(baseline, quote.field).includes(quote.quote) && containsOnlyEditedText(quote, candidate, baseline));
  if (change.kind === 'moved') {
    const moved = (old, next) => next.field === old.field && next.quote === old.quote
      && touchesSide(old, 'before') && touchesSide(next, 'after');
    return before.every(old => after.some(next => moved(old, next))) && after.every(next => before.some(old => moved(old, next)));
  }
  if (change.kind !== 'modified') return false;
  const connected = (old, next) => old.field === next.field && old.quote !== next.quote
    && diff.changes.some(edit => edit.field === old.field && touches(old, edit, 'before') && touches(next, edit, 'after'));
  return before.every(old => after.some(next => connected(old, next))) && after.every(next => before.some(old => connected(old, next)));
}
