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
    const { chatHistory, userMemory } = await req.json().catch(() => ({ chatHistory: [], userMemory: null }));

    if (apiKey) {
      const modelsToTry = [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-2.0-flash-lite'
      ];

      // Format previous conversation turn history for multi-turn learning
      const formattedContents: any[] = [];

      if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        chatHistory.slice(-8).forEach((msg: any) => {
          if (msg.sender === 'user') {
            formattedContents.push({
              role: 'user',
              parts: [{ text: msg.text }],
            });
          } else if (msg.sender === 'ai') {
            formattedContents.push({
              role: 'model',
              parts: [{ text: msg.text }],
            });
          }
        });
      }

      // Context instructions for Web Search & User Memory Learning
      const systemInstruction = `You are an expert AI Form Builder & Web Researcher for FormFlow.
You create, extend, and modify interactive web form schemas based on natural language user requests.

WEB SEARCH GROUNDING & KNOWLEDGE:
Use online industry standards, real-world best practices, and search knowledge to generate highly accurate questions, logical field groupings, standard select options, and placeholders for any domain (e.g. Medical Intakes, Job Applications, ISO Compliance, Event Registrations, Customer NPS, University Registrations).

LEARNED USER MEMORY & PREFERENCES:
${userMemory ? JSON.stringify(userMemory, null, 2) : 'No prior user memory recorded yet.'}
(Incorporate the user's preferred styles, colors, question patterns, and past preferences into the generated schema).

CURRENT FORM SCHEMA ON CANVAS:
${currentSchema ? JSON.stringify(currentSchema, null, 2) : 'None (Blank Canvas)'}

AVAILABLE FIELD TYPES:
- "short_text": Single-line text input
- "paragraph": Multi-line text input
- "multiple_choice": Dropdown/radio selection with "options" array
- "yes_no": Binary Yes/No switch
- "rating": Star rating (1-5)
- "file_upload": File/document attachment
- "date_picker": Date selector
- "welcome_screen": Header poster screen

RULES FOR OUTPUT:
1. Return ONLY a valid JSON object without markdown formatting.
2. If the user asks to modify an existing question (e.g. "change name to...", "rename question label...", "change label of question 1..."), find that question in 'currentSchema.fields' and update its 'label' or 'placeholder' or 'options'!
3. If the user asks to change text/label/question color (e.g. "change name color to purple", "make text color yellow", "change label color"), set 'theme.text' AND/OR set 'textColor' property on the questions to the requested color!
4. If modifying or adding to currentSchema, preserve existing question IDs ('id') when updating them, and generate new 'q_...' IDs for new questions.
5. Provide a helpful, friendly summary in 'replyMessage' explaining what was created or modified.

JSON Structure required:
{
  "replyMessage": "Detailed friendly message explaining what was added/updated",
  "actionType": "create" | "add_fields" | "theme" | "modify",
  "learnedMemory": {
    "preferredTheme": "string description",
    "favoriteFieldTypes": ["list"],
    "commonTopics": ["list"]
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
      "posterTitle": "Title",
      "posterSubtitle": "Subtitle"
    }
  }
}`;

      // Append current turn
      formattedContents.push({
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nUser Request: "${prompt}"` }],
      });

      for (const model of modelsToTry) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: formattedContents,
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
              if (parsed.schema && parsed.schema.fields) {
                // Ensure schema theme merges with existing theme properties
                const mergedTheme: FormTheme = {
                  ...DEFAULT_THEME,
                  ...(currentSchema?.theme || {}),
                  ...(parsed.schema.theme || {}),
                };

                if (parsed.schema.theme?.primary && !mergedTheme.bannerColor) {
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

    // --- High-Intelligence Local AI Form Engine ---
    let actionType: 'create' | 'add_fields' | 'theme' | 'modify' = 'create';
    let replyMessage = '';
    let newFields: FormField[] = [];
    let updatedTheme: FormTheme = currentSchema?.theme || { ...DEFAULT_THEME };
    let title = currentSchema?.title || 'Untitled Form';
    let description = currentSchema?.description || 'Form generated with AI Assistant.';

    // Intent 1: Theme & Visual Updates
    if (
      lowerPrompt.includes('theme') ||
      lowerPrompt.includes('color') ||
      lowerPrompt.includes('poster') ||
      lowerPrompt.includes('banner') ||
      lowerPrompt.includes('dark') ||
      lowerPrompt.includes('cyberpunk') ||
      lowerPrompt.includes('purple') ||
      lowerPrompt.includes('blue') ||
      lowerPrompt.includes('yellow') ||
      lowerPrompt.includes('red') ||
      lowerPrompt.includes('green') ||
      lowerPrompt.includes('amber')
    ) {
      actionType = 'theme';
      if (lowerPrompt.includes('purple') || lowerPrompt.includes('cyberpunk') || lowerPrompt.includes('violet')) {
        updatedTheme = {
          ...updatedTheme,
          primary: '#8B5CF6',
          background: '#0F172A',
          cardBackground: '#1E293B',
          backgroundType: 'solid',
          bannerColor: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
          posterTitle: updatedTheme.posterTitle || 'Electric Purple Theme',
          posterSubtitle: updatedTheme.posterSubtitle || 'Custom AI Form Styling',
        };
        replyMessage = '✨ Applied Electric Purple Banner & Background Theme!';
      } else if (lowerPrompt.includes('ocean') || lowerPrompt.includes('blue') || lowerPrompt.includes('cyan')) {
        updatedTheme = {
          ...updatedTheme,
          primary: '#38BDF8',
          background: '#0F172A',
          cardBackground: '#1E293B',
          backgroundType: 'solid',
          bannerColor: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
          posterTitle: updatedTheme.posterTitle || 'Oceanic Blue Theme',
          posterSubtitle: updatedTheme.posterSubtitle || 'Clean & Modern Survey',
        };
        replyMessage = '✨ Applied Deep Ocean Blue Banner Theme!';
      } else if (lowerPrompt.includes('emerald') || lowerPrompt.includes('green')) {
        updatedTheme = {
          ...updatedTheme,
          primary: '#10B981',
          background: '#064E3B',
          cardBackground: '#065F46',
          backgroundType: 'solid',
          bannerColor: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
          posterTitle: updatedTheme.posterTitle || 'Emerald Green Theme',
          posterSubtitle: updatedTheme.posterSubtitle || 'Fresh Organic Theme',
        };
        replyMessage = '✨ Applied Emerald Green Banner Theme!';
      } else if (lowerPrompt.includes('amber') || lowerPrompt.includes('yellow') || lowerPrompt.includes('gold')) {
        updatedTheme = {
          ...updatedTheme,
          primary: '#F59E0B',
          background: '#451A03',
          cardBackground: '#78350F',
          backgroundType: 'solid',
          bannerColor: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          posterTitle: updatedTheme.posterTitle || 'Warm Gold Amber Theme',
          posterSubtitle: updatedTheme.posterSubtitle || 'Vibrant Warm Styling',
        };
        replyMessage = '✨ Applied Warm Amber Gold Banner Theme!';
      } else {
        const hexMatch = lowerPrompt.match(/#(?:[0-9a-fA-F]{3}){1,2}/);
        const hex = hexMatch ? hexMatch[0] : '#8B5CF6';
        updatedTheme = {
          ...updatedTheme,
          primary: hex,
          text: lowerPrompt.includes('text') || lowerPrompt.includes('name') ? hex : updatedTheme.text,
          bannerColor: `linear-gradient(135deg, ${hex} 0%, #0F172A 100%)`,
          posterTitle: updatedTheme.posterTitle || 'Custom Theme Color',
        };
        replyMessage = `✨ Updated theme color and banner to ${hex}!`;
      }

      // Apply text color update to fields if requested
      if (lowerPrompt.includes('text') || lowerPrompt.includes('name color') || lowerPrompt.includes('label color')) {
        const targetColor = updatedTheme.primary || '#8B5CF6';
        updatedTheme.text = targetColor;
        const fields = (currentSchema?.fields || []).map((f) => ({ ...f, textColor: targetColor }));
        
        return NextResponse.json({
          replyMessage: `✨ Updated question name & text colors to ${targetColor}!`,
          actionType: 'theme',
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
