import React, { useState } from 'react';
import { useWellBeing } from '../../hooks/useWellBeing';
import { CategoryMenu } from '../CategoryMenu/CategoryMenu';
import { QuestionSlider } from '../QuestionSlider/QuestionSlider';
import { Results } from '../Results/Results';
import './style.css';

export default function App() {
  const {
    state,
    handleSelectQuestion,
    handleAnswerChange,
    navigateQuestion,
    onSubmit,
  } = useWellBeing();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    categories,
    answers,
    submitting,
    submitted,
    results,
    loadingError,
    currentCategoryKey,
    currentQuestionIndex,
  } = state;

  if (loadingError) {
    return (
      <div className="app-container error-container">
        <h2>Chyba při načítání otázek</h2>
        <pre>{String(loadingError)}</pre>
      </div>
    );
  }

  if (!Object.keys(categories).length) {
    return <div className="app-container">Načítám otázky…</div>;
  }

  if (submitted) {
    return (
      <div className="app-container">
        <Results results={results} categories={categories} />
      </div>
    );
  }

  const currentCategory = categories[currentCategoryKey];
  const currentQuestion = currentCategory?.questions[currentQuestionIndex];

  const categoryKeys = Object.keys(categories);
  const isLastCategory = currentCategoryKey === categoryKeys[categoryKeys.length - 1];
  const isLastQuestion = currentQuestionIndex === currentCategory?.questions.length - 1;
  const isLastQuestionInForm = isLastCategory && isLastQuestion;

  const checkUnansweredQuestions = () => {
    let unansweredCount = 0;
    categoryKeys.forEach(catKey => {
      const cat = categories[catKey];
      cat.questions.forEach(q => {
        if (answers?.[catKey]?.[q.id] === undefined) {
          unansweredCount++;
        }
      });
    });
    return unansweredCount;
  };

  const handleSubmitClick = () => {
    const unanswered = checkUnansweredQuestions();
    if (unanswered > 0) {
      setShowConfirmModal(true);
    } else {
      onSubmit();
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    onSubmit();
  };

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className="app-container">
      <h1>Well-being dotazník</h1>
      <div className="main-layout">
        <CategoryMenu
          categories={categories}
          answers={answers}
          currentCategoryKey={currentCategoryKey}
          onSelectQuestion={handleSelectQuestion}
        />
        <main className="main-content">
          {currentQuestion ? (
            <>
              <div className="question-header">
                <ul className="question-navigation">
                  {currentCategory.questions.map((q, index) => {
                    const isAnswered = answers?.[currentCategoryKey]?.[q.id] !== undefined;
                    const isCurrent = index === currentQuestionIndex;
                    return (
                      <li
                        key={q.id}
                        onClick={() => handleSelectQuestion(currentCategoryKey, index)}
                        className={`nav-item ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}`}
                      >
                        {index + 1}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="question-container">
                <QuestionSlider
                  key={currentQuestion.id}
                  category={currentCategoryKey}
                  question={currentQuestion}
                  value={answers?.[currentCategoryKey]?.[currentQuestion.id]}
                  onChange={handleAnswerChange}
                />
              </div>
              <div className="navigation-buttons">
                <button onClick={() => navigateQuestion(-1)}>
                  Předchozí
                </button>
                {isLastQuestionInForm ? (
                  <button onClick={handleSubmitClick} disabled={submitting} className="submit-button">
                    {submitting ? 'Odesílám…' : 'Zobrazit výsledky'}
                  </button>
                ) : (
                  <button onClick={() => navigateQuestion(1)}>
                    Následující
                  </button>
                )}
              </div>
            </>
          ) : (
            <p>Vyberte kategorii pro začátek.</p>
          )}
        </main>
      </div>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Upozornění</h2>
            <p>Máte nezodpovězené otázky ({checkUnansweredQuestions()}). Opravdu chcete pokračovat?</p>
            <div className="modal-buttons">
              <button onClick={handleCancelSubmit} className="modal-cancel">
                Zpět
              </button>
              <button onClick={handleConfirmSubmit} className="modal-confirm">
                Ano, zobrazit výsledky
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

