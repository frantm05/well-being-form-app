import React from 'react';
import './CategoryMenu.css';

export function CategoryMenu({ categories, answers, currentCategoryKey, onSelectQuestion }) {
  return (
    <aside className="category-menu">
      <h2>Well-being dimensions</h2>
      {Object.entries(categories).map(([key, category]) => {
        const answeredCount = category.questions.filter(q => answers?.[key]?.[q.id] !== undefined).length;
        const totalCount = category.questions.length;
        const isCurrentCategory = currentCategoryKey === key;

        return (
          <div key={key} className="category-group">
            <h3
              className={`category-title ${isCurrentCategory ? 'active' : ''}`}
              onClick={() => onSelectQuestion(key, 0)}
            >
              {category.title} ({answeredCount}/{totalCount})
            </h3>
            
          </div>
        );
      })}
    </aside>
  );
}