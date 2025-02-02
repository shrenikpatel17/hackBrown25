"use client"

import Image from "next/image";
import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { authActions } from '../../state/reducers/authSlice';
import { useRouter } from "next/navigation";

export default function StoryPage({params}) {
    const storyID = (params).slug
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const router = useRouter();


    const [activeStory, setActiveStory] = useState(null)
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHealthyOnLeft, setIsHealthyOnLeft] = useState(Math.random() < 0.5);
    const [showFeedback, setShowFeedback] = useState(false);
    const [lastChoiceWasHealthy, setLastChoiceWasHealthy] = useState(false);
    const [totalPointsEarned, setTotalPointsEarned] = useState(0);
    const [showFinalScreen, setShowFinalScreen] = useState(false);

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
            // Find the video after dispatching
            const storyObject = data.data.find(story => story._id === storyID);
            if (storyObject) {
                setActiveStory(storyObject);
            }
        }
        } catch (error) {
            console.error("Error fetching stories:", error);
        }
    }
    fetchStories();
    }, [user, storyID])


    const handleChoice = (isHealthy) => {
        setShowFeedback(true);
        setLastChoiceWasHealthy(isHealthy);
    
        if (isHealthy) {
            // Correct answer: add points and continue to the next scene
            dispatch(authActions.incrementPoints());
            setTotalPointsEarned(prev => prev + 10); // Add 10 points
        } else {
            // Incorrect answer: deduct points but don't continue immediately
            dispatch(authActions.decrementPoints());
            setTotalPointsEarned(prev => prev - 5);  // Deduct 5 points
        }
    
        if (isHealthy) {
            // Only auto-continue if the answer was correct
            setTimeout(() => {
                setShowFeedback(false);
                if (currentIndex < activeStory.scenePrompts.length - 1) {
                    // Proceed to the next scene
                    setCurrentIndex(currentIndex + 1);
                    setIsHealthyOnLeft(Math.random() < 0.5);
                } else {
                    // If it's the last scene, show the final screen
                    setShowFinalScreen(true);
                }
            }, 2100);
        }
    };
    
    const handleContinue = () => {
        // Manually continue if the answer was wrong
        setShowFeedback(false);
        if (currentIndex < activeStory.scenePrompts.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsHealthyOnLeft(Math.random() < 0.5);
        } else {
            setShowFinalScreen(true);
        }
    };    

    console.log(activeStory)

    const FeedbackOverlay = ({ isVisible, isCorrect, correctAnswer, onContinue }) => {
        return isVisible ? (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="text-center">
              {isCorrect ? (
                <div className="animate-score-bounce">
                  <span className="text-green-400 text-8xl font-bold">+10</span>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="animate-score-bounce">
                    <span className="text-red-400 text-8xl font-bold">-5</span>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg max-w-md mx-auto mt-4">
                    <p className="text-white text-xl mb-2">The healthy choice was:</p>
                    <p className="text-green-400 text-xl">{correctAnswer}</p>
                  </div>
                  <button
                    onClick={onContinue}
                    className="mt-4 px-6 py-2 bg-white/30 hover:bg-white/50 
                             text-white rounded-lg transition-colors duration-200"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null;
      };

      const FinalScreen = ({ totalPoints }) => {
        const pointsColor = totalPoints > 0 ? 'text-green-500' : 'text-red-500';
    
        return (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg text-center max-w-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Story Completed!</h2>
                    <p className="text-lg text-gray-700">Points Earned: 
                        <span className={`font-semibold ${pointsColor}`}>
                            {totalPoints}
                        </span>
                    </p>
                    <button
                        onClick={() => router.push(`/dashboard`)}
                        className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                    >
                        Home
                    </button>
                </div>
            </div>
        );
    };
    

    return (
        <>
        {activeStory && (
            <>
            <div className="relative min-h-screen overflow-y-auto overflow-x-hidden">
            {/* Background Image */}
            <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-500"
                style={{
                backgroundImage: `url(${activeStory.sceneImageURLs[currentIndex]})`
                }}
            />
            
            {/* Content Container */}
            <div className="relative z-10 flex flex-col min-h-screen p-6">
                {/* Scene Prompt Box */}
                <div className="mx-auto w-full max-w-3xl mt-8 mb-auto">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg py-4 px-6 transition-all duration-500">
                    <p className="text-lg text-center text-gray-800">
                    {activeStory.scenePrompts[currentIndex]}
                    </p>
                </div>
                </div>

                {/* Choices Container */}
                <div className="mt-auto mb-8 w-full flex justify-between gap-6 px-6">
                {/* Left Choice */}
                <div className="w-1/2">
                    <div 
                    onClick={() => handleChoice(isHealthyOnLeft)}
                    className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 
                                transition-all duration-300 hover:scale-105 cursor-pointer"
                    >
                    <p className="text-gray-800">
                        {isHealthyOnLeft ? activeStory.choices[currentIndex].healthy : activeStory.choices[currentIndex].unhealthy}
                    </p>
                    </div>
                </div>

                {/* Right Choice */}
                <div className="w-1/2">
                    <div 
                    onClick={() => handleChoice(!isHealthyOnLeft)}
                    className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 
                                transition-all duration-300 hover:scale-105 cursor-pointer"
                    >
                    <p className="text-gray-800">
                        {isHealthyOnLeft ? activeStory.choices[currentIndex].unhealthy : activeStory.choices[currentIndex].healthy}
                    </p>
                    </div>
                </div>
                </div>

                {/* Optional: Progress Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <p className="text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                    Scene {currentIndex + 1} of {activeStory.scenePrompts.length}
                </p>
                </div>
            </div>
            </div>

            {showFinalScreen ? (
            <FinalScreen totalPoints={totalPointsEarned} onGoToDashboard={() => router.push('/dashboard')} />
            ) : (
            <>
                {/* Your existing story UI */}
                <FeedbackOverlay 
                    isVisible={showFeedback}
                    isCorrect={lastChoiceWasHealthy}
                    correctAnswer={activeStory.choices[currentIndex].healthy}
                    onContinue={handleContinue}
                />
            </>
            )}
          </>
        )}
        {/* Add required styles to your global CSS or Tailwind config */}
        <style jsx global>{`
            @keyframes score-bounce {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.4); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
            }
            .animate-score-bounce {
            animation: score-bounce 0.5s ease-out forwards;
            }
        `}</style>
        </>
    );
}