import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const systemPromptTemplate = handlebars.compile(
  fs.readFileSync(path.join(dirname, 'prompt.hbs'), 'utf8')
);

export function makeSystemPrompt(params: Record<string, string>) {
  return systemPromptTemplate({
    ...params,
    __dirname: dirname,
  });
}
