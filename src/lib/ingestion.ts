/** Parse RFC-4180-style CSV rows, including quoted commas, quotes, and newlines. */
export function parseCsvRecords(text: string): Array<Record<string, string | number | boolean | null>> {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell.length === 0) {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => header.trim());
  if (headers.some((header) => !header)) throw new Error('CSV column names cannot be blank.');
  if (new Set(headers).size !== headers.length) throw new Error('CSV column names must be unique.');

  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => {
    const raw = (values[index] ?? '').trim();
    if (!raw) return [header, null];
    if (/^(true|false)$/i.test(raw)) return [header, raw.toLowerCase() === 'true'];
    if (/^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(raw)) return [header, Number(raw)];
    return [header, raw];
  })));
}
