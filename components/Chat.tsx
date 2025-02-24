import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { ModeToggle } from "./elements/toggle-mode";
import { CircleSlash, RotateCcw } from "lucide-react";
import { Input } from "./ui/input";
import { ModelOptions } from "./elements/model-options";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatProps {
  userId: string | number;
}

const Chat: React.FC<ChatProps> = ({ userId }) => {
  const [chatHistory, setChatHistory] = useState<
    { role: string; message: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const streamingOptions = useRef({ stop: false });

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    const userMessage = input;
    setInput("");

    const res = await fetch("/api/saveChat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, prompt: userMessage }),
    });

    const data = await res.json();
    const aiMessage = data.response;

    setChatHistory((prev) => [
      ...prev,
      { role: "user", message: userMessage },
      { role: "ai", message: aiMessage },
    ]);

    setLoading(false);
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

      <h1 className="font-bold text-2xl">Chat with me</h1>

      <div className="relative max-w-xl w-full p-4 border rounded-md flex flex-col h-96 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {chatHistory.map((chat, idx) => (
            <div
              key={idx}
              className={`flex ${
                chat.role === "user" ? "justify-end" : "justify-start"
              } space-x-2`}
            >
              <div
                className={`p-2 rounded-md ${
                  chat.role === "user" ? "bg-blue-100" : "bg-gray-200"
                }`}
              >
                <Markdown
                  className="prose dark:prose-invert prose-h1:text-xl prose-sm"
                  remarkPlugins={[remarkGfm]}
                >
                  {chat.message}
                </Markdown>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 items-center justify-end">
          {loading && (
            <Button onClick={handleStop}>
              <CircleSlash />
            </Button>
          )}
          <Button
            disabled={loading || !chatHistory.length}
            onClick={() => setChatHistory([])}
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
          />
          <Button type="submit" disabled={loading || !input.length}>
            {loading ? "Sending..." : "Send message"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
