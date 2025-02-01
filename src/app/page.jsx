"use client"

import Image from "next/image";
import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { authActions } from '../app/state/reducers/authSlice';
import { useRouter } from "next/navigation";


export default function Home() {

  const[userPrompt, setUserPrompt] = useState("");
  const [loadingScenes, setLoadingScenes] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [buildingChoices, setBuildingChoices] = useState(false);
  const [savingStory, setSavingStory] = useState(false);

  // const user = useSelector((state) => state.auth.user)
  // console.log(user)

  // const handleStart = async () => {
  //   try {
  //     // Step 1: Generate prompts
  //     setLoadingScenes(true);
  //     const promptResponse = await fetch('/api/generatePrompts', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ userPrompt }),
  //     });
  
  //     if (!promptResponse.ok) {
  //       throw new Error('Failed to generate prompts');
  //     }
  
  //     const promptData = await promptResponse.json();
  //     console.log("Generated Prompts:", promptData.promptArray);
  //     setLoadingScenes(false);
  
  //     // Step 2: Generate choices
  //     setBuildingChoices(true);
  //     const choicesResponse = await fetch('/api/generateChoices', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ promptArray: promptData.promptArray }),
  //     });
  
  //     if (!choicesResponse.ok) {
  //       throw new Error('Failed to generate choices');
  //     }
  
  //     const choicesData = await choicesResponse.json();
  //     console.log("Generated Choices:", choicesData.optionsArray);
  //     setBuildingChoices(false);
  
  //     // Step 3: Pass promptArray to image generation API
  //     setLoadingImages(true);
  //     // const imageResponse = await fetch('/api/generateImgs', {
  //     //   method: 'POST',
  //     //   headers: {
  //     //     'Content-Type': 'application/json',
  //     //   },
  //     //   body: JSON.stringify({ promptArray: promptData.promptArray }),
  //     // });
  
  //     // if (!imageResponse.ok) {
  //     //   throw new Error('Failed to generate images');
  //     // }
  
  //     // const imageData = await imageResponse.json();
  //     // console.log("Generated Image URLs:", imageData.imageUrls);
  //     setLoadingImages(false);
  
  //     // Convert userPrompt to Camel Case
  //     const camelCaseTitle = userPrompt
  //       .split(" ")
  //       .map((word, index) =>
  //         index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)
  //       )
  //       .join("");
  
  //     // Final structured object
  //     const finalResult = {
  //       title: camelCaseTitle,
  //       scenePrompts: promptData.promptArray,
  //       sceneImageURLs: imageData.imageUrls,
  //       choices: choicesData.optionsArray,
  //     };
  
  //     console.log("Final Output:", finalResult);
  //     return finalResult;
  
  //   } catch (error) {
  //     console.error('Error in handleStart:', error);
  //     return "Error generating prompts, choices, or images. Please try again.";
  //   }
  // };
  

  return (
   <>
   <div className="relative min-h-screen overflow-y-auto overflow-x-hidden">
   <h1 className="text-xl">HealthyTales</h1>

   {/* <input
      type="text"
      value={userPrompt}
      onChange={(e) => setUserPrompt(e.target.value)}
      placeholder="Learn about..."
      className="w-1/4 mt-4 text-black placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
      required
    />

    <button
      onClick={() => handleStart()}
      className={`w-1/6 mt-8 flex justify-center py-3 px-3 border border-transparent rounded-xl text-sm font-medium text-white bg-black hover:bg-white hover:text-black`}
    >
      Start
    </button> */}

    

   </div>
   </>
  );
}
