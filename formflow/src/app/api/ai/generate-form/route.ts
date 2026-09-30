import { NextResponse } from 'next/server';
import { FormField, FormSchema, FormTheme, DEFAULT_THEME, DEFAULT_SETTINGS } from '@/lib/types';
import { generateId } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    // 1. Read request body EXACTLY ONCE to avoid "body used already" stream errors
    const body = await req.json().catch(() => ({}));
    const { prompt, currentSchema, chatHistory = [], userMemory = null } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const lowerPrompt = prompt.toLowerCase();
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // --- Gemini API with Grounding & Multi-Turn History ---
    if (apiKey) {
      const modelsToTry = [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-2.0-flash-lite'
      ];

      const systemInstructionText = `You are an expert AI Form Builder Assistant for FormFlow.
You create, extend, edit, and style interactive web form schemas based on natural language user requests.

CRITICAL INTENT RULES & SCHEMA INVARIANTS:
1. ADDING QUESTIONS / FIELDS (e.g. "add email field", "add a rating question", "include resume upload"):
   - KEEP ALL existing fields from 'currentSchema.fields' intact!
   - Append the new field(s) with fresh 'q_...' IDs to the end of fields array.
   - DO NOT remove or replace existing questions.

2. EDITING EXISTING QUESTIONS / FIELDS (e.g. "rename field 1", "change label of email question to...", "make question 2 required", "change question color to yellow"):
   - Locate the target field in 'currentSchema.fields'.
   - Update ONLY the requested properties (e.g. 'label', 'required', 'placeholder', 'options', 'textColor').
   - Keep all other questions and their exact 'id' strings intact.

3. THEME & COLOR UPDATES ONLY (e.g. "change banner color to purple", "make background dark", "change text color to yellow"):
   - KEEP ALL questions in 'currentSchema.fields' EXACTLY AS THEY ARE!
   - Update 'schema.theme' (primary, text, background, backgroundType, bannerColor, posterTitle, posterSubtitle).

4. CREATING A NEW FORM FROM SCRATCH (ONLY when user explicitly requests a brand new form, e.g. "create a job application form", "start a fresh event survey"):
   - Generate a fresh title, description, and list of fields tailored to the domain.

CURRENT FORM SCHEMA ON CANVAS:
${currentSchema ? JSON.stringify(currentSchema, null, 2) : 'None (Blank Canvas)'}

USER PREFERENCES & MEMORY:
${userMemory ? JSON.stringify(userMemory, null, 2) : 'None'}

AVAILABLE FIELD TYPES:
- "short_text": Single-line text input
- "paragraph": Multi-line text input
- "multiple_choice": Dropdown/radio selection with "options" array (string[])
- "yes_no": Binary Yes/No switch
- "rating": Star rating (1-5)
- "file_upload": File/document attachment
- "date_picker": Date selector
- "welcome_screen": Header poster screen

OUTPUT FORMAT REQUIREMENT:
You MUST respond with a JSON object matching this exact structure:
{
  "replyMessage": "Clear, friendly explanation of what was added, edited, or styled.",
  "actionType": "create" | "add_fields" | "theme" | "modify",
  "learnedMemory": {
    "preferredTheme": "string description",
    "favoriteFieldTypes": ["list of types"],
    "commonTopics": ["list of topics"]
  },
  "schema": {
    "title": "Form Title",
    "description": "Form Description",
    "fields": [
      {
        "id": "q_123",
        "type": "short_text",
        "label": "Field Label",
        "textColor": "#8B5CF6",
        "required": true,
        "placeholder": "Sample placeholder",
        "options": ["Option 1", "Option 2"]
      }
    ],
    "theme": {
      "primary": "#8B5CF6",
      "text": "#8B5CF6",
      "background": "#05070D",
      "backgroundType": "solid",
      "bannerColor": "linear-gradient(135deg, #8B5CF6 0%, #0F172A 100%)",
      "posterTitle": "Title",
      "posterSubtitle": "Subtitle"
    }
  }
}`;

      // Build conversation contents cleanly
      const formattedContents: any[] = [];

      if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        // Exclude huge schema payloads from past turns to keep history compact
        chatHistory.slice(-6).forEach((msg: any) => {
          if (msg.sender === 'user' && typeof msg.text === 'string') {
            formattedContents.push({
              role: 'user',
              parts: [{ text: msg.text }],
            });
          } else if (msg.sender === 'ai' && typeof msg.text === 'string') {
            formattedContents.push({
              role: 'model',
              parts: [{ text: msg.text }],
            });
          }
        });
      }

      // Add current user prompt as the final turn
      formattedContents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });

      for (const model of modelsToTry) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: systemInstructionText }],
                },
                contents: formattedContents,
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.2,
                },
                tools: [{ googleSearch: {} }],
              }),
            }
          );

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (responseText) {
              const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleanedText);

              if (parsed.schema && Array.isArray(parsed.schema.fields)) {
                // Ensure field IDs exist
                parsed.schema.fields = parsed.schema.fields.map((f: any, idx: number) => ({
                  ...f,
                  id: f.id || generateId(`q_${idx}`),
                }));

                // Ensure theme merges cleanly
                const mergedTheme: FormTheme = {
                  ...DEFAULT_THEME,
                  ...(currentSchema?.theme || {}),
                  ...(parsed.schema.theme || {}),
                };

                if (parsed.schema.theme?.primary && !parsed.schema.theme.bannerColor) {
                  mergedTheme.bannerColor = `linear-gradient(135deg, ${parsed.schema.theme.primary} 0%, #0F172A 100%)`;
                }

                parsed.schema.theme = mergedTheme;
                return NextResponse.json(parsed);
              }
            }
          }
        } catch (geminiError) {
          console.warn(`Gemini API model ${model} attempt error:`, geminiError);
        }
      }
    }

    // --- High-Intelligence Local AI Form Engine (Fallback) ---
    let actionType: 'create' | 'add_fields' | 'theme' | 'modify' = 'create';
    let replyMessage = '';
    let updatedTheme: FormTheme = currentSchema?.theme ? { ...currentSchema.theme } : { ...DEFAULT_THEME };
    let title = currentSchema?.title || 'Untitled Form';
    let description = currentSchema?.description || 'Form generated with AI Assistant.';
    let fields: FormField[] = currentSchema?.fields ? [...currentSchema.fields] : [];

    const isExplicitNewForm =
      lowerPrompt.includes('create a new form') ||
      lowerPrompt.includes('build a new form') ||
      lowerPrompt.includes('start over') ||
      lowerPrompt.includes('reset form') ||
      fields.length === 0;

    // Intent A: Text/Label color change or Theme modification
    if (
      lowerPrompt.includes('theme') ||
      lowerPrompt.includes('color') ||
      lowerPrompt.includes('banner') ||
      lowerPrompt.includes('poster') ||
      lowerPrompt.includes('background') ||
      lowerPrompt.includes('dark') ||
      lowerPrompt.includes('purple') ||
      lowerPrompt.includes('blue') ||
      lowerPrompt.includes('yellow') ||
      lowerPrompt.includes('red') ||
      lowerPrompt.includes('green') ||
      lowerPrompt.includes('amber')
    ) {
      actionType = 'theme';

      let targetColor = '#8B5CF6';
      if (lowerPrompt.includes('purple') || lowerPrompt.includes('violet') || lowerPrompt.includes('cyberpunk')) targetColor = '#8B5CF6';
      else if (lowerPrompt.includes('blue') || lowerPrompt.includes('ocean') || lowerPrompt.includes('cyan')) targetColor = '#38BDF8';
      else if (lowerPrompt.includes('green') || lowerPrompt.includes('emerald')) targetColor = '#10B981';
      else if (lowerPrompt.includes('amber') || lowerPrompt.includes('yellow') || lowerPrompt.includes('gold')) targetColor = '#F59E0B';
      else if (lowerPrompt.includes('red') || lowerPrompt.includes('rose') || lowerPrompt.includes('crimson')) targetColor = '#EF4444';
      else {
        const hexMatch = lowerPrompt.match(/#(?:[0-9a-fA-F]{3}){1,2}/);
        if (hexMatch) targetColor = hexMatch[0];
      }

      updatedTheme.primary = targetColor;
      updatedTheme.bannerColor = `linear-gradient(135deg, ${targetColor} 0%, #0F172A 100%)`;

      if (lowerPrompt.includes('text') || lowerPrompt.includes('label') || lowerPrompt.includes('name color') || lowerPrompt.includes('question color')) {
        updatedTheme.text = targetColor;
        fields = fields.map((f) => ({ ...f, textColor: targetColor }));
        replyMessage = `✨ Updated question name & text colors to ${targetColor}!`;
      } else {
        replyMessage = `✨ Updated form theme and banner color to ${targetColor}!`;
      }

      return NextResponse.json({
        replyMessage,
        actionType,
        schema: {
          title,
          description,
          fields,
          logic: currentSchema?.logic || [],
          theme: updatedTheme,
          settings: currentSchema?.settings || DEFAULT_SETTINGS,
        },
      });
    }

    // Intent B: Explicit New Form Creation
    if (isExplicitNewForm && (lowerPrompt.includes('job') || lowerPrompt.includes('application') || lowerPrompt.includes('hiring'))) {
      title = 'Job Application Form';
      description = 'Please submit your details and resume to apply for this position.';
      fields = [
        { id: generateId('q'), type: 'short_text', label: 'Full Name', required: true, placeholder: 'e.g. Alex Johnson' },
        { id: generateId('q'), type: 'short_text', label: 'Email Address', required: true, placeholder: 'alex@example.com' },
        { id: generateId('q'), type: 'multiple_choice', label: 'Role Applying For', required: true, options: ['Software Engineer', 'Product Designer', 'Product Manager', 'Data Analyst'], selectionMode: 'single' },
        { id: generateId('q'), type: 'file_upload', label: 'Upload Resume / CV', required: true },
        { id: generateId('q'), type: 'paragraph', label: 'Why are you a great fit for this position?', required: false, placeholder: 'Briefly highlight your past experience...' },
        { id: generateId('q'), type: 'rating', label: 'Rate your years of relevant industry experience (1 - 5 stars)', required: false },
      ];
      replyMessage = '🚀 Generated a comprehensive Job Application Form!';
    } else if (isExplicitNewForm && (lowerPrompt.includes('feedback') || lowerPrompt.includes('survey') || lowerPrompt.includes('nps'))) {
      title = 'Customer Feedback Survey';
      description = 'We value your input! Help us improve by providing your honest feedback.';
      fields = [
        { id: generateId('q'), type: 'rating', label: 'How would you rate your overall experience?', required: true },
        { id: generateId('q'), type: 'multiple_choice', label: 'Which feature did you use the most?', required: true, options: ['Form Builder Engine', 'AI Prompt Generator', 'Response Analytics', 'Theme Customization'], selectionMode: 'single' },
        { id: generateId('q'), type: 'yes_no', label: 'Would you recommend FormFlow to a colleague or friend?', required: true },
        { id: generateId('q'), type: 'paragraph', label: 'What additional features or improvements would you like to see?', required: false, placeholder: 'Type your feedback here...' },
      ];
      replyMessage = '⭐ Generated a Customer Feedback Survey!';
    } else if (isExplicitNewForm && (lowerPrompt.includes('event') || lowerPrompt.includes('registration') || lowerPrompt.includes('workshop'))) {
      title = 'Event & Workshop Registration';
      description = 'Reserve your spot for our upcoming event. Fill out the details below.';
      fields = [
        { id: generateId('q'), type: 'short_text', label: 'Full Name', required: true, placeholder: 'John Doe' },
        { id: generateId('q'), type: 'short_text', label: 'Email Address', required: true, placeholder: 'john@company.com' },
        { id: generateId('q'), type: 'date_picker', label: 'Preferred Attendance Date', required: true },
        { id: generateId('q'), type: 'multiple_choice', label: 'Ticket Type', required: true, options: ['General Pass (Free)', 'VIP Access', 'Virtual Stream Only'], selectionMode: 'single' },
        { id: generateId('q'), type: 'yes_no', label: 'Will you be attending the networking dinner afterward?', required: false },
      ];
      replyMessage = '📅 Generated Event Registration Form!';
    }
    // Intent C: Incremental Addition of Questions to Existing Form
    else {
      actionType = fields.length > 0 ? 'add_fields' : 'create';
      const added: FormField[] = [];

      if (lowerPrompt.includes('rating') || lowerPrompt.includes('star')) {
        added.push({ id: generateId('q'), type: 'rating', label: 'How satisfied are you with our service?', required: true });
      }
      if (lowerPrompt.includes('upload') || lowerPrompt.includes('file') || lowerPrompt.includes('pdf') || lowerPrompt.includes('resume')) {
        added.push({ id: generateId('q'), type: 'file_upload', label: 'Upload File / Attachment', required: false });
      }
      if (lowerPrompt.includes('date') || lowerPrompt.includes('calendar') || lowerPrompt.includes('when')) {
        added.push({ id: generateId('q'), type: 'date_picker', label: 'Select Preferred Date', required: true });
      }
      if (lowerPrompt.includes('choice') || lowerPrompt.includes('option') || lowerPrompt.includes('select')) {
        added.push({ id: generateId('q'), type: 'multiple_choice', label: 'Select your choice', required: true, options: ['Option A', 'Option B', 'Option C'], selectionMode: 'single' });
      }
      if (lowerPrompt.includes('email')) {
        added.push({ id: generateId('q'), type: 'short_text', label: 'Email Address', required: true, placeholder: 'name@example.com' });
      }

      if (added.length > 0) {
        fields = [...fields, ...added];
        replyMessage = `✨ Added ${added.length} new question(s) to your form!`;
      } else {
        // Generic question addition
        fields.push({
          id: generateId('q'),
          type: 'short_text',
          label: prompt.length < 50 ? prompt : 'New Question',
          required: false,
          placeholder: 'Type your answer here...',
        });
        replyMessage = `✨ Added new question based on: "${prompt}"`;
      }
    }

    const generatedSchema: FormSchema = {
      title,
      description,
      fields,
      logic: currentSchema?.logic || [],
      theme: updatedTheme,
      settings: currentSchema?.settings || DEFAULT_SETTINGS,
    };

    return NextResponse.json({
      replyMessage,
      actionType,
      schema: generatedSchema,
    });
  } catch (error: any) {
    console.error('AI Form Generation API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate form with AI' },
      { status: 500 }
    );
  }
}

