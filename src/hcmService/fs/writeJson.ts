import fs from 'fs/promises';
import path from 'path';
import { makeError, HcmErrorCodes } from '../errors';

export async function writeJsonFile(filePath: string, data: any): Promise<void> {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (err: any) {
    throw makeError(HcmErrorCodes.IO_ERROR, `Error writing file: ${filePath}`, {
      filePath,
      error: String(err)
    });
  }
}

