import React from "react";

export const ModelOptions = () => {
  return (
    <select className="border rounded-md p-2">
      <option value="gpt-4">GPT-4</option>
      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
    </select>
  );
};
