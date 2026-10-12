import { describe, expect, it } from 'vitest';
import { parseCsvRecords } from './ingestion';

describe('parseCsvRecords', () => {
  it('parses quoted commas, escaped quotes, multiline values, and typed numbers', () => {
    expect(parseCsvRecords('asset,reading,note\r\nahu-1,29.5,"coil, west"\r\nahu-2,30,"said ""check"""'))
      .toEqual([
        { asset: 'ahu-1', reading: 29.5, note: 'coil, west' },
        { asset: 'ahu-2', reading: 30, note: 'said "check"' },
      ]);
  });

  it('rejects malformed and duplicate header rows', () => {
    expect(() => parseCsvRecords('asset,asset\na,b')).toThrow('must be unique');
    expect(() => parseCsvRecords('asset,note\na,"unfinished')).toThrow('unclosed quoted field');
  });
});
