// // app/api/generateScript/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function POST(req: NextRequest) {
//   try {
//     const { userInput } = await req.json();

//     if (!userInput || userInput.trim().length <= 25) {
//       return NextResponse.json(
//         { script: "Could not generate script due to lack of information." },
//         { status: 200 }
//       );
//     }

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [
//         {
//           role: "system",
//           content: "You are a helpful assistant that creates concise, engaging scripts for presentation slides. Keep the script under 60 seconds when spoken."
//         },
//         {
//           role: "user",
//           content: `create a character and write a 3-4 sentence description describing a single scene 
//           from a choose your own adventure that helps little kids learn about: ${userInput}. 
//           please don't give any future results. please don't give any hints either. stick to just the description. 
//           generate 5 of these independent scenarios with the same characters and keep language VERY simple for little kids
//           `
//         }
//       ],
//       max_tokens: 150,
//       temperature: 0.7,
//     });

//     const generatedScript = response.choices[0].message.content || "Unable to generate script.";

//     return NextResponse.json({ script: generatedScript }, { status: 200 });
//   } catch (error) {
//     console.error('Error generating script:', error);
//     return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 });
//   }
// }

// using structured outputs is below...

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the schema for the response structure using Zod
const scriptResponseSchema = z.object({
  promptArray: z.array(z.string()).length(5),  // Enforces an array of exactly 5 strings
});

export async function POST(req: NextRequest) {
  try {
    const { userPrompt } = await req.json();

    if (!userPrompt) {
      return NextResponse.json(
        { script: ["Could not generate script due to lack of information."] },
        { status: 200 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise scenarios for little kids to learn about healthy habits."
        },
        {
          role: "user",
          content: `create a character and write a 3-4 sentence description describing a single scene 
          from a choose your own adventure that helps little kids learn about handling the following situation in a healhty/best manner: ${userPrompt}. 
          please don't give any future results. please don't give any hints either. stick to just the description. 
          generate 5 of these independent scenarios with the same characters and keep language VERY simple for little kids. 
          Do not describe the character, or put anything in front of the actual scene description. Do NOT put any numbers in front of the description.
          Simply return a description of a scene!!!
          Below are a few examples of the types of scenes we are looking for you to come up with.

          Example Scene 1 for "washing hands" as userInput: 
          Lily just finished making a fun Play-Doh dinosaur. Her hands are covered in colorful dough, but her mom is calling her to eat lunch.

          Example Scene 2 for "washing hands" as userInput:
          Mia stepped in a muddy puddle while jumping around outside, and now her shoes and hands are dirty. She wipes her hands on her shirt, deciding that
          they are now clean since there's no visible mud.

          PLEASE ADHERE TO ALL OF THE RULES! THANK YOU IN ADVANCE!`
        }
      ],
      temperature: 0.7,
    });

    const generatedScript = response.choices[0].message.content || "Unable to generate script.";

    // Split the generated script into individual descriptions and ensure it's an array of 5 strings
    const scriptArray = generatedScript.split('\n').filter(line => line.trim() !== '').slice(0, 5);

    // Validate using Zod
    const data = scriptResponseSchema.parse({
      promptArray: scriptArray
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error generating prompts:', error);
    return NextResponse.json({ error: 'Failed to generate prompts' }, { status: 500 });
  }
}
