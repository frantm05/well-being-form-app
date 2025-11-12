import React from "react";
import "./QuestionSlider.css";

export function QuestionSlider({ category, question, value, onChange }) {
  const displayValue = value ?? 5;
  return (
    <div className="question-row">
      <div className="question-text">{question.text}</div>
      <div className="slider-container">
        <input
          type="range"
          min="0"
          max="10"
          value={displayValue}
          onChange={(e) => onChange(category, question.id, Number(e.target.value))}
          className="slider-input"
        />
        <div className="slider-value">{displayValue}</div>
      </div>
    </div>
  );
}
