import { NotionAPI } from 'notion-client';
import { PropertyType as NotionPropertyType } from 'notion-types';
import fs from 'fs';
import * as process from 'node:process';
import { fileURLToPath } from 'url';
import path from 'path';

const notion = new NotionAPI();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  console.log('Resolved .env Path:', envPath); // 디버깅용 로그
  if (fs.existsSync(envPath)) {
    const envData = fs.readFileSync(envPath, 'utf8');
    envData.split('\n').forEach((line) => {
      const [key, value] = line.split('=').map((v) => v.trim());
      if (key && value) {
        process.env[key] = value;
      }
    });
  } else {
    console.error('.env file not found at:', envPath);
    process.exit(1);
  }
}
loadEnv();

interface Option {
  id: string;
  color: string;
  value: string;
}

interface SchemaField {
  name: string;
  type: NotionPropertyType;
  options?: Option[];
  limit?: number;
}

type DynamicSchema = Record<string, SchemaField>;

async function fetchSchema(pageId: string): Promise<DynamicSchema> {
  const recordMap = await notion.getPage(pageId);
  const collection = Object.values(recordMap.collection)[0]?.value;
  const schema = collection?.schema;

  if (!schema) {
    throw new Error('Schema not found in the given Notion page.');
  }

  return schema as DynamicSchema;
}

function generateType(schema: DynamicSchema): string {
  let result = 'export interface NotionProperties {\n';

  for (const key in schema) {
    const field = schema[key];
    const fieldName = field.name;
    const fieldType = field.type;

    const type = (() => {
      switch (fieldType) {
        case 'title':
        case 'text':
        case 'url':
        case 'email':
        case 'phone_number':
          return 'string';
        case 'number':
          return 'number';
        case 'select':
          return field.options
            ? `(${field.options.map((option) => `"${option.value}"`).join(' | ')})[]`
            : 'string';
        case 'multi_select':
          return field.options
            ? `(${field.options
                .map((option) => `"${option.value}"`)
                .join(' | ')})[]`
            : 'string[]';
        case 'date':
          return '{ type: string; start_date: string }';
        case 'file':
          return '{ url: string }[]';
        case 'person':
          return '{ id: string; name: string; profile_photo: string }[]';
        case 'checkbox':
          return 'boolean';
        case 'created_time':
        case 'last_edited_time':
        case 'status':
          return 'string';
        default:
          return 'unknown';
      }
    })();

    result += `  ${fieldName}: ${type};\n`;
  }

  result += '}';
  return result;
}

async function main() {
  const args = process.env.pageId || process.argv.slice(1);
  const pageId = typeof args === 'string' ? args : args[0];

  if (!pageId) {
    console.error(
      'Error: Please provide a Notion page ID as the first argument.'
    );
    process.exit(1);
  }

  try {
    console.log(`Fetching schema from Notion for page ID: ${pageId}...`);
    const schema = await fetchSchema(pageId);

    console.log('Generating TypeScript types...');
    const types = generateType(schema);

    console.log('Saving types to src/types.d.ts...');
    fs.writeFileSync('./src/types.d.ts', types);

    console.log('Type definitions generated successfully!');
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unknown error', error);
    }
  }
}

main();
