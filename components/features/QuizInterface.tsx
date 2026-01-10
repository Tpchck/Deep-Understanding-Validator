'use client';

import Link from 'next/link';
import { useState } from 'react';

export interface Props {
  question: string;
  code: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function QuizInterface({
  question,
  code,
  options,
  correctIndex,
  explanation,
}: Props) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleOptionClick = (index: number) => {
    if (!isSubmitted) {
      setSelectedOption(index);
    }
  };

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setIsSubmitted(true);
    }
  };

  const getButtonColor = (index: number) => {
    if (!isSubmitted) {
      return index === selectedOption ? 'bg-blue-700' : 'bg-gray-700';
    }

    if (index === correctIndex) {
      return 'bg-green-500';
    }

    if (index === selectedOption && index !== correctIndex) {
      return 'bg-red-600';
    }

    return 'bg-gray-700';
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto p-6">
    
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
         <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 font-mono border-b border-gray-700">
            source_code.cpp
         </div>
         <pre className="p-4 overflow-x-auto text-sm font-mono text-green-400">
           {code}
         </pre>
      </div>
      <h2 className="text-2xl font-bold text-white">
        {question}
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(index)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 font-medium text-lg relative ${getButtonColor(
              index
            )}`}
            disabled={isSubmitted}
          >
            {option}
          </button>
        ))}
      </div>
      {!isSubmitted && selectedOption !== null && (
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-white text-black font-bold text-xl rounded-lg hover:bg-gray-200 transition-colors mt-4"
        >
          Confirm Answer
        </button>
      )}

      {isSubmitted && (
        <div
          className={`p-6 rounded-lg border mt-4 ${
            selectedOption === correctIndex
              ? 'bg-green-900/20 border-green-800'
              : 'bg-red-900/20 border-red-800'
          }`}
        >
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            {selectedOption === correctIndex ? 'Correct!' : 'Incorrect'}
          </h3>
          <p className="text-gray-300 leading-relaxed">{explanation}</p>
          <Link href="/" className="inline-block mt-4 text-blue-400 hover:underline">
             ← Try another snippet
          </Link>
        </div>
      )}
    </div>
  );
}