"use client"

import Image from "next/image";
import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { authActions } from '../state/reducers/authSlice';
import { useRouter } from "next/navigation";
import { LightbulbIcon, Music } from 'lucide-react';
import brownbg from '../../../public/images/brownbg.png';
import { GiStrawberry } from 'react-icons/gi';
import { Play, Pause, Loader2 } from 'lucide-react';


export default function Dashboard() {

  const[userPrompt, setUserPrompt] = useState("");
  const [loadingScenes, setLoadingScenes] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [buildingChoices, setBuildingChoices] = useState(false);
  const [savingStory, setSavingStory] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [createdStoryID, setCreatedStoryID] = useState("");
  const [generalLoading, setGeneralLoading] = useState(false);
  const [allStories, setAllStories] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(new Audio());

  const playAudio = async () => {
    try {
        setIsLoading(true);
        
        // Stop any existing audio
        audioRef.current.pause();
        if (audioRef.current.src) {
            URL.revokeObjectURL(audioRef.current.src);
            audioRef.current.src = '';
        }

        // Create the audio source (in a real app, you may fetch this from your backend)
        const response = await fetch('/api/readAloud', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: modalContent.rhyme }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate speech');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
        };

        await audioRef.current.play();
        setIsPlaying(true);
        } catch (error) {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            playAudio();
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                if (audioRef.current.src) {
                    URL.revokeObjectURL(audioRef.current.src);
                }
            }
        };
    }, []);

  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  // console.log(user)

  useEffect(() => {
    if(!user) {
      router.push("/login")
      return;
    }

    const fetchStories = async () => {
        try {
            const response = await fetch(`/api/auth/?query=${user?._id}`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            if (response.ok) {
              setAllStories(data.data)
        }
        } catch (error) {
            console.error("Error fetching stories:", error);
        }
    }
    fetchStories();
    }, [user])
  
  const dispatch = useDispatch();

  const handleStart = async () => {
    setGeneralLoading(true);
    try {
      // Step 1: Generate prompts
      setLoadingScenes(true);
      const promptResponse = await fetch('/api/generatePrompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userPrompt }),
      });
  
      if (!promptResponse.ok) {
        throw new Error('Failed to generate prompts');
      }
  
      const promptData = await promptResponse.json();
      console.log("Generated Prompts:", promptData.promptArray);
      setLoadingScenes(false);
  
      // Step 2: Generate choices
      setBuildingChoices(true);
      const choicesResponse = await fetch('/api/generateChoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ promptArray: promptData.promptArray }),
      });
  
      if (!choicesResponse.ok) {
        throw new Error('Failed to generate choices');
      }
  
      const choicesData = await choicesResponse.json();
      console.log("Generated Choices:", choicesData.optionsArray);
      setBuildingChoices(false);

      // Step 3: Generating lessons and rhyme
      setGeneratingContent(true);
      const lessonsResponse = await fetch('/api/generateLessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ choices: choicesData.optionsArray }),
      });
  
      if (!lessonsResponse.ok) {
        throw new Error('Failed to generate lessons');
      }
  
      const lessonsData = await lessonsResponse.json();
      console.log("Generated lessons:", lessonsData.lessons)

      const rhymeResponse = await fetch('/api/generateRhyme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userPrompt }),
      });
  
      if (!rhymeResponse.ok) {
        throw new Error('Failed to generate lessons');
      }
  
      const rhymeData = await rhymeResponse.json();
      console.log("Generated rhyme:", rhymeData.rhyme)
      setGeneratingContent(false);
  
      // Step 4: Pass promptArray to image generation API
      setLoadingImages(true);
      const imageResponse = await fetch('/api/generateImgs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ promptArray: promptData.promptArray }),
      });
  
      if (!imageResponse.ok) {
        throw new Error('Failed to generate images');
      }
  
      const imageData = await imageResponse.json();
      console.log("Generated Image URLs:", imageData.imageUrls);
      setLoadingImages(false);

      //Step 5: save story to mongodb
      setSavingStory(true);
      const formattedTitle = userPrompt
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
  
      // Final structured object
      const finalResult = {
        userID: user._id,
        title: formattedTitle,
        scenePrompts: promptData.promptArray,
        sceneImageURLs: imageData.imageUrls,
        choices: choicesData.optionsArray,
        lessons: lessonsData.lessons,
        rhyme: rhymeData.rhyme,
    };

      try {
        const response = await fetch('/api/stories', {
          method: 'POST',
          body: JSON.stringify(finalResult),
        });
  
        if (!response.ok) {
          throw new Error('Failed to create video object');
        }
  
        const data = await response.json();
        console.log(data)
        setCreatedStoryID(data.data._id)
  
        if (response.ok) {
          dispatch(
              authActions.addStoryToUser(data.data._id)
          )
          router.push(`/story/${data.data._id}`);
      }
  
      } catch (error) {
        console.error('Error creating video object', error);
      } 
      setSavingStory(false);
      setGeneralLoading(false);
  
      console.log("Final Output:", finalResult);
      return finalResult;
  
    } catch (error) {
      console.error('Error in handleStart:', error);
      return "Error generating prompts, choices, or images. Please try again.";
    }
  };

  const healthyHabits = [
    "Eat fruits and vegetables every day",
    "Drink plenty of water",
    "Exercise regularly",
    "Get enough sleep",
    "Wash hands frequently",
    "Brush teeth twice a day",
    "Take breaks from screens",
    "Spend time outdoors",
    "Wear sunscreen when outside",
    "Practice good posture when sitting",
  ];

  const [currentHabitIndex, setCurrentHabitIndex] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    if (generalLoading) {
      const intervalId = setInterval(() => {
        setCurrentHabitIndex(prev => (prev + 1) % healthyHabits.length);
      }, 3000); // Cycle every 3 seconds

      return () => clearInterval(intervalId); // Clean up on unmount
    }
  }, [generalLoading]);

  useEffect(() => {
    if (loadingScenes) setCurrentTask("Generating prompts...");
    else if (loadingImages) setCurrentTask("Generating images...");
    else if (buildingChoices) setCurrentTask("Building choices...");
    else if (generatingContent) setCurrentTask("Generating content...")
    else if (savingStory) setCurrentTask("Saving story...");
    else setCurrentTask("");
  }, [loadingScenes, loadingImages, buildingChoices, generatingContent, savingStory]);


  const HealthTaleModal = () => {
    console.log(modalContent)
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50">
        <div className="w-1/2 h-screen bg-brown-modal-bg p-12 animate-slide-left rounded-2xl overflow-scroll">
          <button 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-6 right-6 text-brown-dark-green hover:text-green-600"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
  
          <h2 className="flex items-center justify-center text-5xl font-light text-brown-dark-green font-SpicyRice mb-8">
            {modalContent.title}
          </h2>
  
          <div className="space-y-6 mb-12">
            {modalContent.lessons.map((lesson, index) => (
              <div key={index} className="flex items-start gap-4">
                <LightbulbIcon className="w-8 h-8 text-brown-dark-green font-SpicyRice mt-1 flex-shrink-0" />
                <p className="text-md text-brown-dark-green font-SpicyRice">{lesson}</p>
              </div>
            ))}
          </div>
  
          <div className="mt-8">
            {/* Header with play button */}
            <div className="flex items-center justify-center gap-2 mb-4">
                <h3 className="text-5xl font-thin text-brown-dark-green font-SpicyRice ml-6 mr-6">rhyme time</h3>
                <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="ml-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-brown-dark-green" />
                    ) : isPlaying ? (
                        <Pause className="w-6 h-6 text-brown-dark-green" />
                    ) : (
                        <Play className="w-6 h-6 text-brown-dark-green" />
                    )}
                </button>
            </div>

              {/* Rhyme Text */}
              <div className="text-brown-dark-green font-SpicyRice text-md space-y-2">
                  {modalContent.rhyme.split('\n').map((line, index) => (
                      <p key={"rhymeLine" + index} className="text-center">{line}</p>
                  ))}
              </div>
          </div>
        </div>
      </div>
    );
  };
  
  

  return (
   <>
   {generalLoading && (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <div className="text-center">
          <p className="mt-4 text-6xl text-white font-SpicyRice">
            {healthyHabits[currentHabitIndex]}
          </p>
          <p className="mt-36 text-xs text-gray-100">
            {currentTask || "Processing..."}
          </p>
        </div>
      </div>
    )}
    
   <div className="relative w-screen h-screen">
      <Image 
        src={brownbg} 
        alt="Background" 
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      <div className="absolute top-6 right-6 z-20">
        <div className="bg-brown-pale-green/75 backdrop-blur-sm border-2 border-brown-dark-green rounded-full py-2 px-4 flex items-center gap-2">
          <GiStrawberry className="w-6 h-6 text-red-500" />
          <span className="font-SpicyRice text-xl text-brown-dark-green">{user.points}</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="bg-brown-pale-green/75 backdrop-blur-sm border border-brown-dark-green border-2 rounded-xl p-8 w-[400px]">
          <h1 className="text-5xl font-SpicyRice text-brown-dark-green mb-6 text-center">
            healthytales
          </h1>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="An adventure about..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="font-SpicyRice bg-brown-modal-bg text-brown-dark-green w-full px-4 py-2 rounded-lg border-2 border-brown-dark-green focus:outline-none focus:border-brown-dark-green"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {/* <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brown-dark-green hover:bg-brown-parrot-green cursor-pointer">
                  <Search className="w-4 h-4 text-white hover:text-brown-dark-green" />
                </div> */}
              </div>
            </div>
          </div>
          <div className='flex items-center justify-center'>
            <button 
              onClick={() => handleStart()}
              className="w-3/4 hover:bg-brown-parrot-green font-SpicyRice text-xl hover:text-brown-dark-green bg-brown-dark-green text-white py-[.45rem] rounded-lg transition-colors duration-200">
              begin
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 flex justify-center w-full">
        <div className="bg-brown-pale-green/75 border p-4 rounded-lg shadow-lg flex gap-4">
        {allStories && user.stories && user.stories.length > 0 ? (
          <>
          {allStories.map((story, index) => (
            <>
            <div className="flex flex-col items-center">
              <button
                key={index}
                onClick={() => { setModalContent(story); setIsModalOpen(true); }}
                className="z-20 w-20 h-20 bg-brown-dark-green rounded-lg flex items-center justify-center shadow-md hover:bg-brown-parrot-green transition-colors duration-200"
              >
                <svg
                  className="w-10 h-10 text-brown-pale-green hover:text-brown-dark-green"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </button>
              <button
                key={index}
                onClick={() => { router.push(`/story/${story._id}`); }}
                className="z-20 text-brown-dark-green mt-2 px-3 py-1 border border-brown-dark-green border-1 hover:bg-white/50 hover:text-brown-dark-green font-Barlow rounded-lg"
              >
                Redo
              </button>
            </div>

            </>
          ))}
          </>
        ):(
          <p className="font-SpicyRice text-lg">No stories available</p>
        )}
        </div>
      </div>

    {modalContent && isModalOpen && (
          <HealthTaleModal/>
    )}

    </div>
   </>
  );
}
