"use client";

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [showStartScreen, setShowStartScreen] = useState(true);

  const handleStartGame = async () => {
    if (!playerName) {
      alert("Vul je naam in om te beginnen!");
      return;
    }
    setShowStartScreen(false);
    setLoading(true);
    setFeedback("");

    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "start_game",
          player_name: playerName
        }),
      });

      if (!response.ok) {
        throw new Error("Netwerkrespons was niet ok.");
      }

      const data = await response.json();

      if (data) {
        setQuestion(data.question);
        setFeedback(data.feedback || "");
        setScore(data.score || 0);
        setCurrentQuestionData(data);
        setShowInput(true);
      } else {
        throw new Error("Ongeldige response van de AI");
      }
    } catch (error) {
      console.error("Fout bij het ophalen van de game-data:", error);
      setQuestion("Er ging iets mis. Probeer het opnieuw.");
      setFeedback("");
      setShowInput(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");

    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "answer_question",
          answer: userInput,
          current_state: currentQuestionData,
          player_name: playerName
        }),
      });

      if (!response.ok) {
        throw new Error("Netwerkrespons was niet ok.");
      }

      const data = await response.json();

      if (data) {
        setQuestion(data.question);
        setFeedback(data.feedback || "");
        setScore(prevScore => prevScore + (data.score || 0));
        setCurrentQuestionData(data);
        setUserInput("");
      } else {
        throw new Error("Ongeldige response van de AI");
      }
    } catch (error) {
      console.error("Fout bij het versturen van het antwoord:", error);
      setQuestion("Er ging iets mis met het verwerken van je antwoord. Probeer het opnieuw.");
      setFeedback("");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (option) => {
    setUserInput(option);
    // Direct submit na het klikken op een optie
    handleSubmit({ preventDefault: () => {} });
  };

  const isMultipleChoice = currentQuestionData && Array.isArray(currentQuestionData.options) && currentQuestionData.options.length > 0;

  if (showStartScreen) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-900 text-white">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <h1 className="text-3xl font-bold mb-4">Certified Realms</h1>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center mt-8 p-6 bg-white/10 rounded-xl shadow-lg w-full max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Voer je naam in, Cloud Vanguard</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleStartGame(); }} className="w-full max-w-sm">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center"
              placeholder="Jouw naam"
              maxLength="20"
            />
            <button
              type="submit"
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Start Je Missie!
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-900 text-white">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-3xl font-bold mb-4">Certified Realms</h1>
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Score: {score}
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center mt-8 p-6 bg-white/10 rounded-xl shadow-lg w-full max-w-2xl text-center">
        <div className="text-xl font-bold mb-4">
          <p>{currentQuestionData?.question || question}</p>
        </div>
        
        {feedback && (
          <div className="text-md text-gray-400 mb-4">
            <p>{feedback}</p>
          </div>
        )}

        {loading && <p>Laden...</p>}
        
        {showInput && isMultipleChoice && (
          <div className="w-full">
            <div className="flex flex-col space-y-2 mt-4">
              {currentQuestionData.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  className={`p-2 rounded-md transition text-white text-left ${
                    userInput === option ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  disabled={loading}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {showInput && !isMultipleChoice && (
          <form onSubmit={handleSubmit} className="w-full">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="mt-4 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Typ hier je actie of antwoord..."
              disabled={loading}
            />
            <button
              type="submit"
              className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
              disabled={loading}
            >
              Versturen
            </button>
          </form>
        )}
      </div>
    </main>
  );
}