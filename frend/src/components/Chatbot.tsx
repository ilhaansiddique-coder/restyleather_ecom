"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, X, Send, Sparkles, ExternalLink, RefreshCw, Bot, User, ChevronDown } from "lucide-react";
import { ChatMessage } from "@/lib/types";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-1",
      sender: "bot",
      text: "Assalamu Alaikum! I am Karigor AI, your master leather artisan concierge. Ask me about cowhide quality, custom fits, Dhaka/outside delivery, or tracking your order.",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageSequence = useRef(0);

  const quickQuestions = [
    "Which wallet fits 1000 Tk notes?",
    "Track my order (e.g. BD-78291)",
    "What is full-grain vs top-grain?",
    "Delivery charges & time?",
    "How to care for cowhide leather?",
    "Any active coupon code?",
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${++messageSequence.current}`,
      sender: "user",
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${++messageSequence.current}`,
        sender: "bot",
        text: data.reply || "Thank you for reaching out to our Savar leather atelier.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedAction: data.suggestedAction,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMessage: ChatMessage = {
          id: `bot-err-${++messageSequence.current}`,
          sender: "bot",
          text: "I am having trouble connecting to the workshop database. Please call us directly at +880 1725-293963.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden">
      {/* Floating Trigger Pill (Rule 18: Finger-friendly minimum 44px) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 bg-stone-900 text-stone-100 hover:bg-stone-950 px-4 py-3 rounded-full shadow-luxury-lg border border-amber-600/40 hover:border-amber-500 transition-all duration-300 active:scale-95"
          aria-label="Open Karigor AI Leather Concierge"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white shadow-sm">
            <MessageSquare className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-stone-900 animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-tight flex items-center gap-1.5">
              Karigor AI
              <Sparkles className="w-3 h-3 text-amber-400" />
            </p>
            <p className="text-[10px] text-amber-300 font-medium">Artisan Leather Concierge</p>
          </div>
        </button>
      )}

      {/* Expanded Chatbot Modal */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-96 h-[540px] max-h-[85vh] bg-white rounded-2xl shadow-luxury-lg border border-stone-300/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white font-serif-luxury font-bold text-sm">
                HL
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight">Karigor AI Concierge</h3>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">Handcrafted Leather Specialist</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setMessages([
                    {
                      id: `init-${Date.now()}`,
                      sender: "bot",
                      text: "Assalamu Alaikum! How can I help you choose genuine full-grain leather today?",
                      timestamp: "Just now",
                    },
                  ])
                }
                title="Reset conversation"
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick FAQ Chips */}
          <div className="p-2.5 bg-stone-50 border-b border-stone-200 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-full bg-white border border-stone-200 hover:border-amber-600 hover:text-amber-800 text-[11px] font-medium text-stone-600 whitespace-nowrap transition-colors flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/40">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-amber-700 text-white flex-shrink-0 flex items-center justify-center text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-amber-700 text-white rounded-br-xs shadow-sm"
                      : "bg-white text-stone-800 border border-stone-200/90 rounded-bl-xs shadow-luxury-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  <div
                    className={`text-[9px] mt-1.5 ${
                      m.sender === "user" ? "text-amber-200 text-right" : "text-stone-400"
                    }`}
                  >
                    {m.timestamp}
                  </div>

                  {/* Contextual Action Button */}
                  {m.suggestedAction && (
                    <div className="mt-2.5 pt-2 border-t border-stone-100">
                      <Link
                        href={m.suggestedAction.target}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-grad btn-grad--fit text-white text-[11px] font-semibold shadow-sm"
                      >
                        <span>{m.suggestedAction.label}</span>
                        <ExternalLink className="w-3 h-3 text-amber-400" />
                      </Link>
                    </div>
                  )}
                </div>
                {m.sender === "user" && (
                  <div className="w-7 h-7 rounded-full bg-stone-800 text-stone-200 flex-shrink-0 flex items-center justify-center text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-amber-700 text-white flex-shrink-0 flex items-center justify-center text-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-xs p-3 text-xs shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about our leather..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl btn-grad btn-grad--fit disabled:opacity-40 text-white flex items-center justify-center shadow-sm flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
