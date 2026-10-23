import {
  applyEdits,
  type JSONPath,
  modify,
  parse,
  type ParseError,
} from 'jsonc-parser';
import { readFile, writeFile } from 'node:fs/promises';

export type JsonEdit = [path: JSONPath, value: unknown];

/** Applies edits to a JSON or JSONC file, keeping comments and formatting. Returns whether it changed. */
export const editJsonFile = async (
  file: string,
  edits: (data: Record<string, unknown>) => JsonEdit[]
): Promise<boolean> => {
  const text = await readFile(file, 'utf8');
  const errors: ParseError[] = [];
  const data = parse(text, errors, { allowTrailingComma: true }) as unknown;
  if (errors.length || typeof data !== 'object' || data === null) {
    throw new Error(`Could not parse ${file}`);
  }

  let next = text;
  for (const [path, value] of edits(data as Record<string, unknown>)) {
    next = applyEdits(
      next,
      modify(next, path, value, {
        formattingOptions: { insertSpaces: true, tabSize: detectIndent(text) },
      })
    );
  }
  if (next === text) return false;
  await writeFile(file, next);
  return true;
};

export const readJson = async <T = Record<string, unknown>>(
  file: string
): Promise<T> => {
  return parse(await readFile(file, 'utf8')) as T;
};

const detectIndent = (text: string): number => {
  return /^( +)\S/m.exec(text)?.[1]?.length ?? 2;
};
