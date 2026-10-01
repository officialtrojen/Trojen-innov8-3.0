import { NextResponse } from 'next/server';
import { FormField, FormSchema, FormTheme, DEFAULT_THEME, DEFAULT_SETTINGS } from '@/lib/types';
import { generateId } from '@/lib/utils';

function normalizeFieldType(rawType: string): FormField['type'] {
  const t = (rawType || '').toLowerCase().trim();
  if (
    t === 'short_text' ||
    t === 'short_answer' ||
    t === 'text' ||
    t === 'string' ||
    t === 'phone' ||
    t === 'email' ||
    t === 'input' ||
    t === 'number' ||
    t === 'name'
  ) {
    return 'short_text';
  }
  if (t === 'paragraph' || t === 'long_answer' || t === 'essay' || t === 'textarea' || t === 'explanation') {
    return 'paragraph';
  }
  if (
    t === 'multiple_choice' ||
    t === 'mcq' ||
    t === 'radio' ||
    t === 'dropdown' ||
    t === 'checkbox' ||
    t === 'select' ||
    t === 'multiselect'
  ) {
    return 'multiple_choice';
  }
  if (t === 'yes_no' || t === 'boolean' || t === 'switch' || t === 'true_false') {
    return 'yes_no';
  }
  if (t === 'rating' || t === 'score' || t === 'stars' || t === 'scale') {
    return 'rating';
  }
  if (t === 'file_upload' || t === 'file' || t === 'attachment' || t === 'document' || t === 'pdf') {
    return 'file_upload';
  }
  if (t === 'date_picker' || t === 'date' || t === 'calendar') {
    return 'date_picker';
  }
  if (t === 'welcome_screen' || t === 'poster' || t === 'banner') {
    return 'welcome_screen';
  }
  return 'short_text';
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, currentSchema, chatHistory = [] } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const trimmedPrompt = prompt.trim();
    const lowerPrompt = trimmedPrompt.toLowerCase();
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in environment variables.' },
        { status: 500 }
      );
    }

    // Determine if user intent is to generate a NEW form vs modifying/adding to current form
    const isExplicitAddFields =
      lowerPrompt.startsWith('add') ||
      lowerPrompt.startsWith('append') ||
      lowerPrompt.startsWith('insert') ||
      lowerPrompt.includes('add a question') ||
      lowerPrompt.includes('add field');

    const isNewFormIntent = !isExplicitAddFields;

    const modelsToTry = [
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-flash-lite-latest',
      'gemini-flash-latest'
    ];

    const systemInstructionText = `You are an expert AI Form Builder Assistant for FormFlow.
Your primary role is to interpret natural-language user requests and dynamically generate complete, interactive web forms using Gemini generative intelligence.

CRITICAL INSTRUCTIONS & ARCHITECTURE RULES:
1. LIVE GOOGLE SEARCH GROUNDING & DEEP REASONING:
   - You MUST use the enabled Google Search grounding tool to research and verify authentic facts, real equations, precise domain terminology, realistic options, and accurate standards across the web for ANY requested topic.
   - For any random or arbitrary request (e.g. quantum physics quiz, medical intake, tech conference, recipe survey, astronomy exam): search the web to extract real-world concepts, questions, distractors, and professional structures.

2. THE USER PROMPT IS AN INSTRUCTION TO GENERATE A FORM, NOT A FIELD LABEL:
   - NEVER create a single question labeled with the user's prompt!
   - NEVER return a single random element or placeholder question!
   - Always generate a COMPLETE, rich, multi-field form (MINIMUM 5 TO 10 SEPARATE EDITABLE QUESTIONS).

3. DYNAMIC FORM GENERATION:
   - Understand the intent of ANY request dynamically.
   - If the user specifies the exact number of questions (e.g., "10 questions", "20 MCQs", "50 question exam"), generate EXACTLY that number of distinct questions!
   - If no question count is specified, generate a complete, sensible form (5 to 10 questions).
   - Include appropriate student/applicant identification fields (Name, Roll No/Email/Phone), multiple-choice questions with authentic options & distractors, open-ended explanations (paragraph), ratings, and document uploads.

4. NEW FORM CREATION MODE (${isNewFormIntent ? 'ACTIVE' : 'INACTIVE'}):
   ${
     isNewFormIntent
       ? `- The user is requesting a NEW form topic.
- DO NOT keep or repeat old unrelated fields from previous forms!
- Set "actionType": "create".
- Generate a COMPLETE brand-new form schema.`
       : `- The user wants to add or modify fields in the existing form schema.
- Append new fields to the current form.`
   }

5. SUPPORTED FIELD TYPES (MUST USE ONLY THESE TYPES):
   - "short_text": Single-line text input
   - "paragraph": Multi-line text input
   - "multiple_choice": Dropdown/radio selection with an "options" array of strings (minimum 2 options)
   - "yes_no": Binary Yes/No switch
   - "rating": Star rating (1 to 5 stars)
   - "file_upload": File/document attachment
   - "date_picker": Date selector
   - "welcome_screen": Header poster screen

CURRENT FORM SCHEMA ON CANVAS:
${isNewFormIntent ? 'None (Creating Fresh New Form)' : JSON.stringify(currentSchema, null, 2)}

OUTPUT FORMAT REQUIREMENT:
You MUST return ONLY a JSON object matching this exact structure:
{
  "replyMessage": "Clear, friendly explanation of the generated form fields.",
  "actionType": "${isNewFormIntent ? 'create' : 'add_fields'}",
  "schema": {
    "title": "Generated Form Title",
    "description": "Generated Form Description",
    "fields": [
      {
        "id": "q_1",
        "type": "short_text" | "paragraph" | "multiple_choice" | "yes_no" | "rating" | "file_upload" | "date_picker",
        "label": "Editable Question / Field Label",
        "required": true,
        "placeholder": "Sample placeholder text...",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
      }
    ],
    "theme": {
      "primary": "#8B5CF6",
      "text": "#F8FAFC",
      "background": "#0B0F19",
      "cardBackground": "#1E293B",
      "backgroundType": "solid"
    }
  }
}`;

    const formattedContents: any[] = [];
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      chatHistory.slice(-4).forEach((msg: any) => {
        if (msg.sender === 'user' && typeof msg.text === 'string') {
          formattedContents.push({ role: 'user', parts: [{ text: msg.text }] });
        } else if (msg.sender === 'ai' && typeof msg.text === 'string') {
          formattedContents.push({ role: 'model', parts: [{ text: msg.text }] });
        }
      });
    }

    formattedContents.push({ role: 'user', parts: [{ text: trimmedPrompt }] });

    let lastError = '';

    for (const model of modelsToTry) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstructionText }] },
              contents: formattedContents,
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3,
              },
              tools: [{ googleSearch: {} }],
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const parts = geminiData?.candidates?.[0]?.content?.parts;
          let responseText = '';
          if (Array.isArray(parts)) {
            for (const part of parts) {
              if (part.text) responseText += part.text + '\n';
            }
          }

          if (responseText) {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : responseText;
            const parsed = JSON.parse(jsonString);

            if (parsed && parsed.schema && Array.isArray(parsed.schema.fields)) {
              // VALIDATION STEP 1: Filter out prompt echoing or generic single placeholder labels
              const validatedFields: FormField[] = [];
              const genericBadLabels = [
                trimmedPrompt.toLowerCase(),
                'math test',
                'math test form',
                'registration form',
                'physics quiz',
                'new question',
                'question',
                'untitled question'
              ];

              parsed.schema.fields.forEach((f: any, idx: number) => {
                if (!f || typeof f !== 'object') return;
                const rawLabel = typeof f.label === 'string' ? f.label.trim() : '';
                if (!rawLabel) return;

                const lowerL = rawLabel.toLowerCase();
                if (genericBadLabels.some((bad) => lowerL === bad)) {
                  return;
                }

                const normType = normalizeFieldType(f.type);
                const validatedField: FormField = {
                  id: f.id || generateId(`q_${idx}`),
                  type: normType,
                  label: rawLabel,
                  required: typeof f.required === 'boolean' ? f.required : false,
                  placeholder: f.placeholder || (normType === 'short_text' ? 'Type your answer here...' : undefined),
                };

                if (normType === 'multiple_choice') {
                  validatedField.options =
                    Array.isArray(f.options) && f.options.length >= 2
                      ? f.options.map((opt: any) => String(opt))
                      : ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
                  validatedField.selectionMode = f.selectionMode === 'multiple' ? 'multiple' : 'single';
                }

                validatedFields.push(validatedField);
              });

              // Ensure at least 3 distinct valid questions were generated
              if (validatedFields.length >= 3) {
                parsed.schema.fields = validatedFields;
                parsed.schema.title = parsed.schema.title || 'Generated Form';
                parsed.schema.description = parsed.schema.description || '';

                const mergedTheme: FormTheme = {
                  ...DEFAULT_THEME,
                  ...(currentSchema?.theme || {}),
                  ...(parsed.schema.theme || {}),
                };
                parsed.schema.theme = mergedTheme;

                return NextResponse.json({
                  replyMessage:
                    parsed.replyMessage ||
                    `✨ Generated ${parsed.schema.title} with ${validatedFields.length} editable fields!`,
                  actionType: isNewFormIntent ? 'create' : (parsed.actionType || 'create'),
                  schema: parsed.schema,
                });
              } else {
                console.warn(`Model ${model} produced insufficient questions (${validatedFields.length}). Retrying next model...`);
                lastError = 'Generated form contained too few valid questions.';
              }
            }
          }
        } else {
          const errBody = await geminiRes.json().catch(() => ({}));
          lastError = errBody?.error?.message || `HTTP ${geminiRes.status}`;
          console.warn(`Gemini model ${model} failed:`, lastError);
        }
      } catch (modelErr: any) {
        lastError = modelErr.message || String(modelErr);
        console.warn(`Gemini model ${model} exception:`, lastError);
      }
    }

    return NextResponse.json(
      {
        error: `AI Form Assistant was unable to generate a valid form structure (${lastError || 'Generation failed'}). Please try again or rephrase your prompt.`,
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('AI Form Assistant API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process AI form request.' },
      { status: 500 }
    );
  }
}
