import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the schema for the response structure using Zod
const lessonResponseSchema = z.object({
  lessons: z.array(z.string()).length(3),  // Enforces an array of exactly 3 lessons
});

export async function POST(req: NextRequest) {
  try {
    const { choices } = await req.json();

    // Check if choices are provided
    if (!choices || choices.length === 0) {
      return NextResponse.json(
        { lessons: ["Could not generate lessons due to lack of choices."] },
        { status: 200 }
      );
    }

    // Create a formatted prompt based on the provided choices
    const formattedChoices = choices
      .map((choice: { healthy: string; unhealthy: string }) => `Healthy choice: ${choice.healthy}, Unhealthy choice: ${choice.unhealthy}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides simple and clear lessons about healthy habits for little kids."
        },
        {
          role: "user",
          content: `Given the following list of healthy and unhealthy choices, generate 3 lessons that can help children understand the importance of making healthy choices and avoiding unhealthy ones:

          ${formattedChoices}

          Use simple language appropriate for little kids. Do not include any markdown characters, brackets, or extra symbols such as "LESSON 1: ...". Just write the lessons directly, separated by newlines, in plain sentences. 
          Make sure the lessons are broad, DO NOT MAKE THEM ABOUT THE SPECIFIC HEALTHY CHOICE. Make sure all 3 lessons are different, but relevant to the input!
          Return the lessons as plain text, one per line. Each lesson should be no longer than a sentence or two. Please ensure that exactly 3 lessons are returned.

          Example output:
          Clean hands before eating
          Eat lots of fruits and vegetables
          Drink water to stay healthy`
        }
      ]
    });

    const generatedLessons = response.choices[0].message.content || "Unable to generate lessons.";

    // Split the generated lessons into individual strings, ensuring it's an array of exactly 3
    const lessonArray = generatedLessons.split('\n').map(line => line.trim()).filter(line => line.length > 0).slice(0, 3);

    // Ensure the array has exactly 3 lessons
    if (lessonArray.length !== 3) {
      return NextResponse.json(
        { lessons: ["Could not generate exactly 3 lessons. Please try again."] },
        { status: 400 }
      );
    }

    // Validate using Zod
    const data = lessonResponseSchema.parse({
      lessons: lessonArray
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error generating lessons:', error);
    return NextResponse.json({ error: 'Failed to generate lessons' }, { status: 500 });
  }
}
