import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import AWS from 'aws-sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const s3 = new AWS.S3({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_AWS_S3_REGION,
});

// Helper function to upload image to S3
async function uploadToS3(imageBuffer: Buffer, filename: string) {
  const params = {
    Bucket: "course-creation-bucket", 
    Key: `hBimages/${filename}`,
    Body: imageBuffer,
    ContentType: 'image/png', 
  };

  try {
    const s3Response = await s3.upload(params).promise();
    return s3Response.Location; // Return the URL of the uploaded image
  } catch (err) {
    console.error('Error uploading image to S3:', err);
    throw new Error('Failed to upload image to S3');
  }
}

// Main handler for the POST request
export async function POST(req: NextRequest) {
  try {
    const { promptArray } = await req.json();

    // Step 1: Generate vivid descriptions for each prompt in promptArray
    const generatedImgPrompts = await Promise.all(
      promptArray.map(async (scenario: string) => {
        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that generates vivid descriptions for an image generation model like DALL-E to use from a given scenario.",
            },
            {
              role: "user",
              content: `Create a vivid description for an image generation model given this prompt: ${scenario}. The generated image should be cartoony and visually appealing for a little kid!!!`,
            },
          ],
          temperature: 0.7,
        });
        return response.choices[0].message.content || "Unable to generate description.";
      })
    );

    // Step 2: Send each vivid description to DALL-E 3 for image generation and upload to S3
    const imageUrls = await Promise.all(
      generatedImgPrompts.map(async (prompt: string, index: number) => {
        try {
          // Use OpenAI SDK to generate the image
          const dalleResponse = await openai.images.generate({
            model: "dall-e-3", 
            prompt: prompt,
            n: 1, // Generate one image
            size: "1792x1024",
            response_format: "b64_json"
          });

          const timestamp = Date.now();
          const filename = `image_${index}_${timestamp}.png`;

          const imageData = dalleResponse.data[0].b64_json;
          if (!imageData) {
            throw new Error(`DALL·E API did not return a valid base64 image for prompt: ${prompt}`);
          }
          const imageBuffer = Buffer.from(imageData, 'base64');
                    const imageUrl = await uploadToS3(imageBuffer, filename);
          return imageUrl;
        } catch (error) {
          console.error(`Error generating or uploading image for prompt ${index + 1}:`, error);
          return null;
        }
      })
    );

    // Filter out any null values in case of failures
    const successfulImageUrls = imageUrls.filter(url => url !== null);

    return NextResponse.json({ imageUrls: successfulImageUrls }, { status: 200 });
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 });
  }
}
