/**
 * Split task text into plain / match segments for highlight rendering.
 */
export function highlightTaskParts(
  task: string,
  query: string
): readonly { text: string; match: boolean }[] {
  const q = query.trim();
  if (!q) {
    return [{ text: task, match: false }];
  }

  const lower = task.toLowerCase();
  const needle = q.toLowerCase();
  const parts: { text: string; match: boolean }[] = [];
  let cursor = 0;

  while (cursor < task.length) {
    const idx = lower.indexOf(needle, cursor);
    if (idx === -1) {
      parts.push({ text: task.slice(cursor), match: false });
      break;
    }
    if (idx > cursor) {
      parts.push({ text: task.slice(cursor, idx), match: false });
    }
    parts.push({ text: task.slice(idx, idx + needle.length), match: true });
    cursor = idx + needle.length;
  }

  return parts.length > 0 ? parts : [{ text: task, match: false }];
}
