import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the schema for validation using Zod
const optionsResponseSchema = z.object({
  optionsArray: z.array(
    z.object({
      healthy: z.string(),
      unhealthy: z.string(),
    })
  ).length(3), // Ensure exactly 3 objects
});

export async function POST(req: NextRequest) {
  try {
    const { promptArray } = await req.json();

    // const promptArray = [
    //     "Ella is playing in the sandbox, making a big sandcastle with her friends. Suddenly, she feels an itch on her face and wants to scratch it with her sandy hands.",
    //     "After drawing a beautiful picture with crayons, Jack notices a small cut on his finger. He thinks about showing it to his teacher, but he's also excited to start the next drawing.",
    //     "Ava is at the park, and she accidentally trips and scrapes her knee on the gravel. She sees a nearby water fountain and considers rinsing the scrape with the water.",
    //     "Max finishes playing with his pet rabbit, and his hands have a faint smell from the rabbit's fur. He hears his mom calling him to help set the table for dinner.",
    //     "Sophie loves helping her dad wash the car, and now her hands are covered in soapy bubbles and dirt. She's about to run inside to grab a snack from the kitchen."
    // ]

    if (!Array.isArray(promptArray) || promptArray.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid input. Expected an array of exactly 3 strings.' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates two possible choices for each scenario: one healthy and one unhealthy."
        },
        {
          role: "user",
          content: `For each of the following scenarios, generate two choices: one healthy and one unhealthy. Remember, these choices are for little kids to learn. Please keep each choice at most 1 sentence long!
          Format your response as JSON with keys 'healthy' and 'unhealthy'. Follow the format of the examples below as a guide.
          
          Scenarios:
          ${promptArray.map((scenario, index) => `${index + 1}. ${scenario}`).join('\n')}

          Example of formatting output! PLEASE FOLLOW THIS FORMAT!!!

          [
            {
              "healthy": "Ella should wash her hands before continuing to play.",
              "unhealthy": "Ella scratches her face with her sandy hands."
            },
            {
              "healthy": "Jack should clean the cut with some antiseptic and bandage it.",
              "unhealthy": "Jack ignores the cut and continues drawing without any care."
            },
            {
              "healthy": "Ava should rinse her knee with the fountain water to clean it.",
              "unhealthy": "Ava decides to ignore the scrape and continues playing without cleaning it."
            },
          ]
          `
        }
      ],
      temperature: 0.7,
    });

    console.log(response.choices[0].message.content)
    let rawResponse = response.choices[0].message.content || '';

    // Remove any Markdown code block formatting (e.g., backticks or triple backticks)
    rawResponse = rawResponse.replace(/```json|```/g, '').trim();

    const generatedOptions = JSON.parse(rawResponse);
    const data = optionsResponseSchema.parse({ optionsArray: generatedOptions });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error generating options:', error);
    return NextResponse.json({ error: 'Failed to generate options' }, { status: 500 });
  }
}
