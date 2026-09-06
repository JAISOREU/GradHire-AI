import { useState, useRef, useEffect } from 'react';
import { aiApi } from '../../core/api/endpoints/ai';
import { ProductAIStyles } from '../landing/visuals/ProductAI';
import { AIInsightPanel, ConversationBubble, SuggestedPrompts, AIStateIndicator, TrustBadge } from '../landing/visuals/ProductAI';

const SUGGESTED_PROMPTS = [
  'What jobs fit my current skills?',
  'What skills should I improve?',
  'Why am I a strong match for this job?',
  'How can I improve my resume?',
];

export const AIAssistantPage = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp?: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiState, setAiState] = useState<'ready' | 'processing' | 'failed'>('ready');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: text.trim(), timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setAiState('processing');
    setError(null);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const response = await aiApi.careerChat(text, conversationHistory);
      const assistantMessage = {
        role: 'assistant' as const,
        content: response.response,
        timestamp: response.timestamp,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setAiState('ready');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setAiState('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setAiState('ready');
    setError(null);
  };

  return (
    <div className="ai-assistant-page">
      <ProductAIStyles />
      <div className="ai-assistant-page__inner">
        <div className="ai-assistant-page__header">
          <h1 className="ai-assistant-page__title">AI Career Assistant</h1>
          <p className="ai-assistant-page__subtitle">
            Ask questions about your career, skills, and opportunities
          </p>
          <TrustBadge level="ai-generated" label="AI-generated insight" />
        </div>

        <div className="ai-assistant-page__content">
          {messages.length === 0 && !isLoading && (
            <div className="ai-assistant-page__empty">
              <AIInsightPanel title="Career Assistant" badge="Ready to help">
                <p className="text-sm text-text-secondary mb-4">
                  I can help you with career advice, job matching, skill development, and more.
                </p>
                <SuggestedPrompts
                  prompts={SUGGESTED_PROMPTS}
                  onSelect={(prompt) => {
                    setInput(prompt);
                    sendMessage(prompt);
                  }}
                />
              </AIInsightPanel>
            </div>
          )}

          {messages.length > 0 && (
            <div className="ai-assistant-page__messages">
              {messages.map((msg, i) => (
                <ConversationBubble
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                />
              ))}
              {isLoading && (
                <div className="ai-assistant-page__loading">
                  <AIStateIndicator state="processing" message="Thinking..." />
                </div>
              )}
              {error && aiState === 'failed' && (
                <div className="ai-assistant-page__error">
                  <AIStateIndicator state="failed" message={error} onRetry={handleRetry} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="ai-assistant-page__input-area">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="ai-assistant-page__form"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a career question..."
                className="ai-assistant-page__input"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="ai-assistant-page__send"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
