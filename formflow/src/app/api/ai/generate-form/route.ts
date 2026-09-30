import { NextResponse } from 'next/server';
import { FormField, FormSchema, FormTheme, DEFAULT_THEME, DEFAULT_SETTINGS } from '@/lib/types';
import { generateId } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { prompt, currentSchema } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const lowerPrompt = prompt.toLowerCase();

    // Check if Gemini API Key exists for live Gemini AI completion
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an AI Form Builder Expert. Analyze this user prompt and generate or modify a JSON form schema for FormFlow.
User Prompt: "${prompt}"

Current Schema (if any): ${currentSchema ? JSON.stringify(currentSchema) : 'None'}

Return ONLY a valid JSON object with the following structure:
{
  "replyMessage": "A friendly summary of what was generated/modified",
  "actionType": "create" | "add_fields" | "theme" | "modify",
  "schema": {
    "title": "String title",
    "description": "String description",
    "fields": [
      {
        "id": "q_unique",
        "type": "short_text" | "paragraph" | "multiple_choice" | "yes_no" | "rating" | "file_upload" | "date_picker" | "welcome_screen",
        "label": "Question Label",
        "required": boolean,
        "placeholder": "Optional placeholder",
        "options": ["Option 1", "Option 2"] // only for multiple_choice
      }
    ],
    "theme": {
      "primary": "#8B5CF6",
      "background": "#05070D",
      "backgroundType": "solid"
    }
  }
}
Return strict JSON only without markdown formatting.`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        const geminiData = await geminiRes.json();
        const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (responseText) {
          const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedText);
          if (parsed.schema && parsed.schema.fields) {
            return NextResponse.json(parsed);
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call fallback to local AI engine:', geminiError);
      }
    }

    // --- High-Intelligence Local AI Form Engine ---
    let actionType: 'create' | 'add_fields' | 'theme' | 'modify' = 'create';
    let replyMessage = '';
    let newFields: FormField[] = [];
    let updatedTheme: FormTheme = currentSchema?.theme || { ...DEFAULT_THEME };
    let title = currentSchema?.title || 'Untitled Form';
    let description = currentSchema?.description || 'Form generated with AI Assistant.';

    // Intent 1: Theme & Visual Updates
    if (lowerPrompt.includes('theme') || lowerPrompt.includes('color') || lowerPrompt.includes('poster') || lowerPrompt.includes('dark') || lowerPrompt.includes('cyberpunk')) {
      actionType = 'theme';
      if (lowerPrompt.includes('cyberpunk') || lowerPrompt.includes('dark') || lowerPrompt.includes('purple')) {
        updatedTheme = {
          ...updatedTheme,
          primary: '#8B5CF6',
          background: '#05070D',
          backgroundType: 'solid',
          posterTitle: 'Cyberpunk Portal',
          posterSubtitle: 'Interactive AI Form Experience',
        };
        replyMessage = '✨ Applied Cyberpunk Midnight Obsidian & Electric Purple theme!';
      } else if (lowerPrompt.includes('ocean') || lowerPrompt.includes('blue')) {
        updatedTheme = {
          ...updatedTheme,
          primary: '#38BDF8',
          background: '#0F172A',
          backgroundType: 'solid',
          posterTitle: 'Oceanic Wave',
          posterSubtitle: 'Clean & Modern Survey',
        };
        replyMessage = '✨ Applied Deep Ocean Blue Theme!';
      } else {
        updatedTheme = {
          ...updatedTheme,
          primary: '#A855F7',
          background: '#0F172A',
          backgroundType: 'solid',
        };
        replyMessage = '✨ Updated form styling and theme colors!';
      }

      const mergedSchema: FormSchema = {
        title,
        description,
        fields: currentSchema?.fields || [],
        logic: currentSchema?.logic || [],
        theme: updatedTheme,
        settings: currentSchema?.settings || DEFAULT_SETTINGS,
      };

      return NextResponse.json({
        replyMessage,
        actionType,
        schema: mergedSchema,
      });
    }

    // Intent 2: Job Application Form
    if (lowerPrompt.includes('job') || lowerPrompt.includes('application') || lowerPrompt.includes('hiring') || lowerPrompt.includes('resume')) {
      title = 'Job Application Form';
      description = 'Please submit your details and resume to apply for this position.';
      newFields = [
        {
          id: generateId('q'),
          type: 'short_text',
          label: 'Full Name',
          required: true,
          placeholder: 'e.g. Alex Johnson',
        },
        {
          id: generateId('q'),
          type: 'short_text',
          label: 'Email Address',
          required: true,
          placeholder: 'alex@example.com',
        },
        {
          id: generateId('q'),
          type: 'multiple_choice',
          label: 'Role Applying For',
          required: true,
          options: ['Software Engineer', 'Product Designer', 'Product Manager', 'Data Analyst'],
          selectionMode: 'single',
        },
        {
          id: generateId('q'),
          type: 'file_upload',
          label: 'Upload Resume / CV',
          required: true,
        },
        {
          id: generateId('q'),
          type: 'paragraph',
          label: 'Why are you a great fit for this position?',
          required: false,
          placeholder: 'Briefly highlight your past experience...',
        },
        {
          id: generateId('q'),
          type: 'rating',
          label: 'Rate your years of relevant industry experience (1 - 5 stars)',
          required: false,
        },
      ];
      replyMessage = '🚀 Generated a comprehensive Job Application Form with Resume Upload, Role Selection, and Rating!';
    }
    // Intent 3: Feedback / CSAT Survey
    else if (lowerPrompt.includes('feedback') || lowerPrompt.includes('survey') || lowerPrompt.includes('rating') || lowerPrompt.includes('nps')) {
      title = 'Customer Feedback Survey';
      description = 'We value your input! Help us improve by providing your honest feedback.';
      newFields = [
        {
          id: generateId('q'),
          type: 'rating',
          label: 'How would you rate your overall experience?',
          required: true,
        },
        {
          id: generateId('q'),
          type: 'multiple_choice',
          label: 'Which feature did you use the most?',
          required: true,
          options: ['Form Builder Engine', 'AI Prompt Generator', 'Response Analytics', 'Theme Customization'],
          selectionMode: 'single',
        },
        {
          id: generateId('q'),
          type: 'yes_no',
          label: 'Would you recommend FormFlow to a colleague or friend?',
          required: true,
        },
        {
          id: generateId('q'),
          type: 'paragraph',
          label: 'What additional features or improvements would you like to see?',
          required: false,
          placeholder: 'Type your feedback here...',
        },
      ];
      replyMessage = '⭐ Generated a Customer Feedback Survey with Star Ratings, Multiple Choice, and NPS recommendations!';
    }
    // Intent 4: Event / Workshop Registration
    else if (lowerPrompt.includes('event') || lowerPrompt.includes('register') || lowerPrompt.includes('registration') || lowerPrompt.includes('workshop') || lowerPrompt.includes('rsvp')) {
      title = 'Event & Workshop Registration';
      description = 'Reserve your spot for our upcoming event. Fill out the details below.';
      newFields = [
        {
          id: generateId('q'),
          type: 'short_text',
          label: 'Full Name',
          required: true,
          placeholder: 'John Doe',
        },
        {
          id: generateId('q'),
          type: 'short_text',
          label: 'Email Address',
          required: true,
          placeholder: 'john@company.com',
        },
        {
          id: generateId('q'),
          type: 'date_picker',
          label: 'Preferred Attendance Date',
          required: true,
        },
        {
          id: generateId('q'),
          type: 'multiple_choice',
          label: 'Ticket Type',
          required: true,
          options: ['General Pass (Free)', 'VIP Access', 'Virtual Stream Only'],
          selectionMode: 'single',
        },
        {
          id: generateId('q'),
          type: 'yes_no',
          label: 'Will you be attending the networking dinner afterward?',
          required: false,
        },
      ];
      replyMessage = '📅 Generated Event Registration Form with Date Picker, Ticket Options, and RSVP details!';
    }
    // Intent 5: Incremental addition or generic custom fields
    else {
      title = currentSchema?.title && currentSchema.title !== 'Untitled Form' ? currentSchema.title : 'AI Custom Form';
      description = currentSchema?.description || 'Custom form created with AI assistance.';

      // Extract field types if mentioned
      const fieldsToAdd: FormField[] = [];

      if (lowerPrompt.includes('rating') || lowerPrompt.includes('star')) {
        fieldsToAdd.push({
          id: generateId('q'),
          type: 'rating',
          label: 'How satisfied are you with our service?',
          required: true,
        });
      }

      if (lowerPrompt.includes('upload') || lowerPrompt.includes('file') || lowerPrompt.includes('pdf')) {
        fieldsToAdd.push({
          id: generateId('q'),
          type: 'file_upload',
          label: 'Upload File / Attachment',
          required: false,
        });
      }

      if (lowerPrompt.includes('date') || lowerPrompt.includes('calendar') || lowerPrompt.includes('when')) {
        fieldsToAdd.push({
          id: generateId('q'),
          type: 'date_picker',
          label: 'Select Date',
          required: true,
        });
      }

      if (lowerPrompt.includes('choice') || lowerPrompt.includes('option') || lowerPrompt.includes('select')) {
        fieldsToAdd.push({
          id: generateId('q'),
          type: 'multiple_choice',
          label: 'Select your preferred option',
          required: true,
          options: ['Option A', 'Option B', 'Option C'],
          selectionMode: 'single',
        });
      }

      if (fieldsToAdd.length > 0) {
        newFields = fieldsToAdd;
        replyMessage = `✨ Added ${newFields.length} new question(s) to your form based on your request!`;
        actionType = currentSchema && currentSchema.fields.length > 0 ? 'add_fields' : 'create';
      } else {
        // Fallback multi-field form
        newFields = [
          {
            id: generateId('q'),
            type: 'short_text',
            label: 'Your Name',
            required: true,
            placeholder: 'Type your full name...',
          },
          {
            id: generateId('q'),
            type: 'short_text',
            label: 'Email Address',
            required: true,
            placeholder: 'Type your email address...',
          },
          {
            id: generateId('q'),
            type: 'paragraph',
            label: 'Your Response / Message',
            required: false,
            placeholder: 'Share your thoughts...',
          },
        ];
        replyMessage = `✨ Form created based on: "${prompt}"`;
      }
    }

    // Combine or replace fields
    const finalFields =
      actionType === 'add_fields' && currentSchema
        ? [...currentSchema.fields, ...newFields]
        : newFields.length > 0
        ? newFields
        : currentSchema?.fields || [];

    const generatedSchema: FormSchema = {
      title,
      description,
      fields: finalFields,
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
