import React, { useState, useEffect } from "react";

interface StarredPageProps {
  userId: string;
}

interface StarredPrompt {
  prompt: string;
  response: string;
  llmUsed: string;
}

const StarredPage: React.FC<StarredPageProps> = ({ userId }) => {
  const [starredPrompts, setStarredPrompts] = useState<StarredPrompt[]>([]);

  useEffect(() => {
    async function fetchStarred() {
      const res = await fetch(`/api/getStarred?userId=${userId}`);
      const data: StarredPrompt[] = await res.json();
      setStarredPrompts(data);
    }
    fetchStarred();
  }, [userId]);

  return (
    <div>
      <h1>Starred Prompts</h1>
      <div>
        {starredPrompts.map((starred, idx) => (
          <div key={idx} className="starred-item">
            <div>
              <strong>Prompt:</strong> {starred.prompt}
            </div>
            <div>
              <strong>Response:</strong> {starred.response}
            </div>
            <div>
              <strong>LLM Used:</strong> {starred.llmUsed}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StarredPage;
