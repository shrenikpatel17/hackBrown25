import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userPrompt } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates cute, catchy nursery rhymes for kids based on lessons that need to be learned."
        },
        {
          role: "user",
          content: `Create a short nursery rhyme on the following lessons: "${userPrompt}". 
          SIMPLY RETURN THE NURSERY RHYME AS A STRING WITH NEW LINES AFTER EACH LINE!!! An example is provide below. DO NOT COPY THE EXAMPLE RHYME!! 
          CREATE A NEW RHYME BASED ON THE USER PROMPT!! DO NOT MAKE IT SIMILAR TO THE EXAMPLE RHYME!! IT MUST ONLY BE ABOUT THE TOPIC SPECIFIED BY THE USER PROMPT!!
          PLEASE ADHERE TO ALL RULES!!!

          Example: (DO NOT COPY!!)

          Wash, wash, wash your hands,
          Rub them here and there,
          Soap and water, scrub them clean,
          Germs don’t live in there!

          Wash the palms, and wash the backs,
          Fingers in between,
          Rinse them off, then dry them well,
          Now your hands are clean!
          `
        }
      ],
      temperature: 0.7,
    });

    const generatedRhyme = response.choices[0].message.content || "Unable to generate rhyme.";

    return NextResponse.json({ rhyme: generatedRhyme }, { status: 200 });
  } catch (error) {
    console.error('Error generating rhyme:', error);
    return NextResponse.json({ error: 'Failed to generate rhyme' }, { status: 500 });
  }
}