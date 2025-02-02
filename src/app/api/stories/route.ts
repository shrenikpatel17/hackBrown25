import { connectMongoDB } from "@/app/lib/mongodb";
import { NextResponse } from "next/server";
import { User } from "@/app/models/User"
import { Story } from "@/app/models/Story";
import mongoose from 'mongoose';

export async function POST( req: Request ) {
    try {
        const { userID, title, scenePrompts, sceneImageURLs, choices, lessons, rhyme } = await req.json();
        
        await connectMongoDB();

        var newStoryObject = {
            title: title,
            scenePrompts: scenePrompts,
            sceneImageURLs: sceneImageURLs,
            choices: choices,
            lessons: lessons,
            rhyme: rhyme,
        };

        const newStory = await Story.create(newStoryObject);
        // console.log(newVideo)

        await User.findByIdAndUpdate(userID, {
            $push: {
              stories: newStory._id
            },
          });

        return NextResponse.json(
            { data: newStory },
            { status: 201 }
            );
        } 
    catch (error: unknown) {
        return NextResponse.json(
            error,
            { status: 500 }
        );
    }
}