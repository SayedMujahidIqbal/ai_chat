"use client";

import React, { useState, useRef } from "react";
import { Button } from "../ui/button";
import { ModeToggle } from "../elements/toggle-mode";
import { CircleSlash, RotateCcw } from "lucide-react";
import { Input } from "../ui/input";
import { ModelOptions } from "../elements/model-options";
import Markdown from "react-markdown";
import { useLLMStore } from "@/store/llm-store";

export default function HomePage() {
  const [result, setResult] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string }[]
  >([]);

  const streamingOptions = useRef<{ stop: boolean }>({ stop: false });

  const model = useLLMStore().selectedModel;

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResult("");
    streamingOptions.current.stop = false;

    const requestBody = JSON.stringify({ userId: "123", prompt: input });

    console.log("Sending request with body:", requestBody);

    setChatHistory([...chatHistory, { role: "user", content: input }]);

    try {
      const response = await fetch("/api/saveChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      console.log("Response data:", data);
      setChatHistory((prevChat) => [
        ...prevChat,
        { role: "assistant", content: data.response },
      ]);

      setResult(data.response);
    } catch (error: unknown) {
      console.error("Error fetching AI response:", error);

      if (error instanceof Error) {
        if (
          error.message === "Failed to fetch" ||
          error.message === "Unexpected token <"
        ) {
          setResult("Failed to get response from the server.");
        } else {
          setResult("Error communicating with AI.");
        }
      } else {
        setResult("Unexpected error occurred.");
      }
    }

    setLoading(false);
    setInput("");
  };

  const handleStop = () => {
    streamingOptions.current.stop = true;
    setLoading(false);
  };

  return (
    <div className="max-w-7xl relative mx-auto h-[100dvh] flex flex-col justify-center items-center space-y-12">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <h1 className="font-bold text-2xl">
        {model.length ? model : "Chat with me"}
      </h1>

      <div className="relative max-w-xl w-full p-4 border rounded-md flex flex-col h-96 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`message p-4 rounded-md max-w-xs break-words ${
                message.role === "user"
                  ? "bg-black text-white ml-auto"
                  : "bg-blue-500 text-white mr-auto"
              }`}
            >
              <p className="font-semibold">
                {message.role === "user" ? "You" : "AI"}
              </p>
              <Markdown className="prose dark:prose-invert">
                {message.content}
              </Markdown>
            </div>
          ))}
        </div>
        <div className="1/5 sticky top-0 right-0 flex gap-2">
          {loading && (
            <Button onClick={handleStop}>
              <CircleSlash />
            </Button>
          )}
          <Button
            disabled={loading || !result.length}
            onClick={() => setResult("")}
          >
            <RotateCcw />
          </Button>
        </div>
      </div>

      <div className="max-w-xl w-full fixed bottom-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex flex-row w-full items-end gap-2"
        >
          <ModelOptions />
          <Input
            placeholder="Type your message here."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2"
          />
          <Button type="submit" disabled={loading || !input.length}>
            {loading ? "Sending..." : "Send message"}
          </Button>
        </form>
      </div>
    </div>
  );
}
