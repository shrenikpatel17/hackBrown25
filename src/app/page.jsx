"use client"

import Image from "next/image";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { LightbulbIcon, Music } from 'lucide-react';
import brownbg from '../../public/images/brownbg.png';
import { GiStrawberry } from 'react-icons/gi';
import { Play, Pause, Loader2 } from 'lucide-react';


export default function Dashboard() {

  const router = useRouter();

  return (
   <>
    
   <div className="relative w-screen h-screen">
      <Image 
        src={brownbg} 
        alt="Background" 
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="bg-brown-pale-green/75 backdrop-blur-sm border border-brown-dark-green border-2 rounded-xl p-8 w-[400px]">
          <h1 className="text-5xl font-SpicyRice text-brown-dark-green mb-6 text-center">
            healthytales
          </h1>

          <div className="mb-6">
            <div className="relative">
              <p className="font-Barlow text-md text-brown-dark-green">Learn healthy habits through gamified stories!</p>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              </div>
            </div>
          </div>
          <div className='flex items-center justify-center'>
            <button 
              onClick={() => router.push('./signup')}
              className="w-3/4 mr-4 hover:bg-brown-parrot-green font-SpicyRice text-xl hover:text-brown-dark-green bg-brown-dark-green text-white py-[.45rem] rounded-lg transition-colors duration-200">
              signup
            </button>
            <button 
              onClick={() => router.push('./login')}
              className="w-3/4 hover:bg-brown-parrot-green font-SpicyRice text-xl hover:text-brown-dark-green border border-2 border-brown-dark-green text-brown-dark-green py-[.45rem] rounded-lg transition-colors duration-200">
              login
            </button>
          </div>
        </div>
      </div>
    </div>
   </>
  );
}
