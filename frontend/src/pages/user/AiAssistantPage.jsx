import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AiChat from '../../components/ai/AiChat';
import { Bot, Sparkles } from 'lucide-react';

const AiAssistantPage = () => {
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [searchParams] = useSearchParams();
  const tokenId = searchParams.get('tokenId');
  const serviceId = searchParams.get('serviceId');

  const suggestedQueries = [
    "How long is the wait for Cardiology?",
    "What services are available right now?",
    "How do I cancel my token?",
    "Explain how the queue works."
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">QueueLess AI Assistant</h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          Ask questions about services, check your queue status, or get help with your account.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" /> Suggested Queries
          </h3>
          <div className="space-y-2">
            {suggestedQueries.map((query, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedQuery(query)}
                className="w-full text-left bg-white p-3 rounded-lg border border-gray-100 text-sm text-gray-700 hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors shadow-sm"
              >
                "{query}"
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-3">
          <AiChat
            tokenId={tokenId}
            serviceId={serviceId}
            initialQuery={selectedQuery}
            onClearInitialQuery={() => setSelectedQuery(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default AiAssistantPage;
