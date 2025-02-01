"use client"

import Image from "next/image";
import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { authActions } from '../app/state/reducers/authSlice';
import { useRouter } from "next/navigation";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";


export default function Home() {

  const[userPrompt, setUserPrompt] = useState("");

  const handleStart = async() => {

    try {
      const response = await fetch('/api/generatePrompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userPrompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const data = await response.json();
      console.log(data)
      console.log(data.promptArray)
      return data.parsedResponse;
    } catch (error) {
      console.error('Error generating script:', error);
      return "Error generating script. Please try again.";
    }
  }


  return (
   <>
   <div className="relative min-h-screen overflow-y-auto overflow-x-hidden">
   <h1 className="text-xl">HealthyTales</h1>

   <input
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
    </button>

    

   </div>
   </>
  );
}
