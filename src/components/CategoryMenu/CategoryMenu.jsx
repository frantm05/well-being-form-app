import React from "react";
import "./CategoryMenu.css";

export function CategoryMenu({
  categories,
  answers,
  currentCategoryKey,
  currentQuestionIndex,
  onSelectQuestion,
}) {
  // Get current category info for mobile display
  const currentCategory = categories[currentCategoryKey];
  const answeredCount = currentCategory
    ? currentCategory.questions.filter(
        (q) => answers?.[currentCategoryKey]?.[q.id] !== undefined
      ).length
    : 0;
  const totalCount = currentCategory ? currentCategory.questions.length : 0;

  return (
    <>
      {/* Mobile-only: Show only current category */}
      <div className="current-category-mobile">
        <h3>{currentCategory?.title || "Category"}</h3>
        <p>
          Question {(currentQuestionIndex || 0) + 1} of {totalCount} (
          {answeredCount} answered)
        </p>
      </div>

      {/* Desktop: Full category menu */}
      <aside className="category-menu">
        <h2>Well-being dimensions</h2>
        {Object.entries(categories).map(([key, category]) => {
          const answeredCount = category.questions.filter(
            (q) => answers?.[key]?.[q.id] !== undefined
          ).length;
          const totalCount = category.questions.length;
          const isCurrentCategory = currentCategoryKey === key;

          return (
            <div key={key} className="category-group">
              <h3
                className={`category-title ${
                  isCurrentCategory ? "active" : ""
                }`}
                onClick={() => onSelectQuestion(key, 0)}
              >
                {category.title} ({answeredCount}/{totalCount})
              </h3>
            </div>
          );
        })}
      </aside>
    </>
  );
}
