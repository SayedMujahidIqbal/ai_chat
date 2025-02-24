import React, { useState } from "react";

export const ModeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  return (
    <button onClick={toggleMode} className="p-2 bg-gray-200 rounded-md">
      {darkMode ? "Light Mode" : "Dark Mode"}
    </button>
  );
};
