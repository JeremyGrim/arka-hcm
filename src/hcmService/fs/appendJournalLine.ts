import fs from 'fs/promises';
import path from 'path';
import { makeError, HcmErrorCodes } from '../errors';

export async function appendJournalLine(journalPath: string, entry: any): Promise<void> {
  try {
    await fs.mkdir(path.dirname(journalPath), { recursive: true });
    const line = JSON.stringify(entry);
    await fs.appendFile(journalPath, line + '\n', 'utf-8');
  } catch (err: any) {
    throw makeError(HcmErrorCodes.IO_ERROR, `Error appending journal: ${journalPath}`, {
      journalPath,
      error: String(err)
    });
  }
}

