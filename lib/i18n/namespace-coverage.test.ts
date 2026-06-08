import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import en from '@/messages/en.json';

// Walk app/ and components/ for source files (excluding tests and build output).
function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectSourceFiles(full, acc);
    } else if (/\.(tsx|ts)$/.test(entry) && !/\.test\.(tsx|ts)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

function resolvePath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>(
    (node, key) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[key] : undefined),
    obj,
  );
}

describe('useTranslations namespace coverage', () => {
  const root = process.cwd();
  const files = [join(root, 'app'), join(root, 'components')].flatMap((d) => collectSourceFiles(d));

  // Only string-literal namespaces — dynamic useTranslations(variable) calls are skipped.
  const namespaceRe = /useTranslations\(\s*['"]([^'"]+)['"]\s*\)/g;
  const referenced = new Set<string>();
  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    let match: RegExpExecArray | null;
    while ((match = namespaceRe.exec(src))) referenced.add(match[1]);
  }

  it('every referenced namespace resolves to an object in en.json', () => {
    const missing = [...referenced].filter((ns) => {
      const value = resolvePath(en as Record<string, unknown>, ns);
      return !(value && typeof value === 'object');
    });
    expect(missing).toEqual([]);
  });
});
