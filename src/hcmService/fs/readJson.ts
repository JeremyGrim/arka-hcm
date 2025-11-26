import fs from 'fs/promises';
import { makeError, HcmErrorCodes } from '../errors';

export async function readJsonFile<T>(filePath: string): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw makeError(HcmErrorCodes.IO_ERROR, `File not found: ${filePath}`, { filePath });
    }
    if (err instanceof SyntaxError) {
      throw makeError(HcmErrorCodes.IO_ERROR, `Invalid JSON in file: ${filePath}`, {
        filePath,
        error: err.message
      });
    }
    throw makeError(HcmErrorCodes.IO_ERROR, `Error reading file: ${filePath}`, {
      filePath,
      error: String(err)
    });
  }
}

