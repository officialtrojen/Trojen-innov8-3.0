import fs from 'fs/promises';
import path from 'path';
import { FormSchema, FormResponse } from '@/types/form';

const DATA_DIR = path.join(process.cwd(), '.data');
const FORMS_FILE = path.join(DATA_DIR, 'forms.json');
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json');

async function ensureDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    try {
      await fs.access(FORMS_FILE);
    } catch {
      await fs.writeFile(FORMS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }

    try {
      await fs.access(RESPONSES_FILE);
    } catch {
      await fs.writeFile(RESPONSES_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('Error ensuring data files:', error);
  }
}

export async function getForms(): Promise<FormSchema[]> {
  await ensureDataFiles();
  try {
    const data = await fs.readFile(FORMS_FILE, 'utf-8');
    return JSON.parse(data) as FormSchema[];
  } catch (err) {
    console.error('Failed reading forms:', err);
    return [];
  }
}

export async function getFormById(id: string): Promise<FormSchema | null> {
  const forms = await getForms();
  return forms.find((f) => f.id === id) || null;
}

export async function saveForm(form: FormSchema): Promise<FormSchema> {
  await ensureDataFiles();
  const forms = await getForms();
  const index = forms.findIndex((f) => f.id === form.id);
  
  const updatedForm = {
    ...form,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    forms[index] = updatedForm;
  } else {
    forms.unshift(updatedForm);
  }

  await fs.writeFile(FORMS_FILE, JSON.stringify(forms, null, 2), 'utf-8');
  return updatedForm;
}

export async function deleteForm(id: string): Promise<boolean> {
  await ensureDataFiles();
  const forms = await getForms();
  const filtered = forms.filter((f) => f.id !== id);
  if (filtered.length === forms.length) return false;
  await fs.writeFile(FORMS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  return true;
}

export async function getResponses(formId?: string): Promise<FormResponse[]> {
  await ensureDataFiles();
  try {
    const data = await fs.readFile(RESPONSES_FILE, 'utf-8');
    const responses = JSON.parse(data) as FormResponse[];
    if (formId) {
      return responses.filter((r) => r.formId === formId);
    }
    return responses;
  } catch (err) {
    console.error('Failed reading responses:', err);
    return [];
  }
}

export async function saveResponse(response: FormResponse): Promise<FormResponse> {
  await ensureDataFiles();
  const responses = await getResponses();
  responses.unshift(response);
  await fs.writeFile(RESPONSES_FILE, JSON.stringify(responses, null, 2), 'utf-8');
  return response;
}
