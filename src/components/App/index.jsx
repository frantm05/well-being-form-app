import React, { useState } from "react";
import { useWellBeing } from "../../hooks/useWellBeing";
import { CategoryMenu } from "../CategoryMenu/CategoryMenu";
import { QuestionSlider } from "../QuestionSlider/QuestionSlider";
import { Results } from "../Results/Results";
import "./style.css";

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
        <h2>Error loading questions</h2>
        <pre>{String(loadingError)}</pre>
      </div>
    );
  }

  if (!Object.keys(categories).length) {
    return <div className="app-container">Loading questions…</div>;
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
  const isLastCategory =
    currentCategoryKey === categoryKeys[categoryKeys.length - 1];
  const isLastQuestion =
    currentQuestionIndex === currentCategory?.questions.length - 1;
  const isLastQuestionInForm = isLastCategory && isLastQuestion;

  const checkUnansweredQuestions = () => {
    let unansweredCount = 0;
    categoryKeys.forEach((catKey) => {
      const cat = categories[catKey];
      cat.questions.forEach((q) => {
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
      <h1>Well-being form</h1>
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
                    const isAnswered =
                      answers?.[currentCategoryKey]?.[q.id] !== undefined;
                    const isCurrent = index === currentQuestionIndex;
                    return (
                      <li
                        key={q.id}
                        onClick={() =>
                          handleSelectQuestion(currentCategoryKey, index)
                        }
                        className={`nav-item ${isCurrent ? "current" : ""} ${
                          isAnswered ? "answered" : ""
                        }`}
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
                <button onClick={() => navigateQuestion(-1)}>Previous</button>
                {isLastQuestionInForm ? (
                  <button
                    onClick={handleSubmitClick}
                    disabled={submitting}
                    className="submit-button"
                  >
                    {submitting ? "Submitting..." : "Show results"}
                  </button>
                ) : (
                  <>
                    <button onClick={() => navigateQuestion(1, true)}>
                      Skip
                    </button>
                    <button
                      onClick={() => {
                        // Save current value before navigating
                        const currentValue =
                          answers?.[currentCategoryKey]?.[currentQuestion.id] ??
                          5;
                        handleAnswerChange(
                          currentCategoryKey,
                          currentQuestion.id,
                          currentValue
                        );
                        navigateQuestion(1, false);
                      }}
                    >
                      Next
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <p>Select a category to start.</p>
          )}
        </main>
      </div>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Warning</h2>
            <p>
              You have unanswered questions ({checkUnansweredQuestions()}). Are
              you sure you want to continue?
            </p>
            <div className="modal-buttons">
              <button onClick={handleCancelSubmit} className="modal-cancel">
                Back
              </button>
              <button onClick={handleConfirmSubmit} className="modal-confirm">
                Yes, show results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
