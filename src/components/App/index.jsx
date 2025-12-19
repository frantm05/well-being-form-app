import React, { useState, useEffect } from "react";
import { useWellBeing } from "../../hooks/useWellBeing";
import { CategoryMenu } from "../CategoryMenu/CategoryMenu";
import { QuestionSlider } from "../QuestionSlider/QuestionSlider";
import { Results } from "../Results/Results";
import { IntroForm } from "../IntroForm/IntroForm";
import { submitData } from "../../api/questions";
import "./style.css";

export default function App() {
  const {
    state,
    handleSelectQuestion,
    handleAnswerChange,
    handleDeleteAnswer,
    navigateQuestion,
    onSubmit,
  } = useWellBeing();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [personalInfo, setPersonalInfo] = useState(null);

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

  const handleIntroComplete = (info) => {
    setPersonalInfo(info);
    setShowIntro(false);
  };

  const getBackendCategoryKey = (displayCategory) => {
    return displayCategory.split(" (")[0].trim().replace(/\s+/g, "_");
  };

  useEffect(() => {
    if (submitted && results && personalInfo) {
      const flattenedAnswers = {};

      Object.keys(categories).forEach((catKey) => {
        const cat = categories[catKey];

        const backendCatKey = getBackendCategoryKey(catKey);

        cat.questions.forEach((q, index) => {
          const questionKey = `${backendCatKey}_Q${index + 1}`;

          flattenedAnswers[questionKey] = answers?.[catKey]?.[q.id] ?? "";
        });
      });

      const payload = {
        personalInfo: {
          nickname: personalInfo.firstName, // This sends 'nickname' to backend
          age: personalInfo.age,
          gender: personalInfo.gender?.value || personalInfo.gender,
          country: personalInfo.country?.value || personalInfo.country,
          university: personalInfo.university?.value || personalInfo.university,
          faculty: personalInfo.faculty,
          major: personalInfo.major,
        },
        // This sends 'overallScore' to backend
        overallScore: results.overall
          ? (
              results.overall /
              Object.keys(categories).reduce(
                (sum, key) => sum + categories[key].questions.length,
                0
              )
            ).toFixed(2)
          : 0,
        answers: flattenedAnswers,
      };

      submitData(payload)
        .then(() => console.log("Data saved"))
        .catch((error) => console.error("Failed:", error));
    }
  }, [submitted, results, personalInfo, categories, answers]);

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
    if (unanswered > 1) {
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
      {showIntro && <IntroForm onComplete={handleIntroComplete} />}

      <h1>Well-being Form</h1>
      <div className="main-layout">
        <CategoryMenu
          categories={categories}
          answers={answers}
          currentCategoryKey={currentCategoryKey}
          currentQuestionIndex={currentQuestionIndex}
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
                  <>
                    <button
                      onClick={() => {
                        handleDeleteAnswer(
                          currentCategoryKey,
                          currentQuestion.id
                        );
                        handleSubmitClick();
                      }}
                    >
                      Not relevant
                    </button>
                    <button
                      onClick={() => {
                        // Save current value before submitting
                        const currentValue =
                          answers?.[currentCategoryKey]?.[currentQuestion.id] ??
                          5;
                        handleAnswerChange(
                          currentCategoryKey,
                          currentQuestion.id,
                          currentValue
                        );
                        handleSubmitClick();
                      }}
                      disabled={submitting}
                      className="submit-button"
                    >
                      {submitting ? "Submitting..." : "Show results"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        handleDeleteAnswer(
                          currentCategoryKey,
                          currentQuestion.id
                        );
                        navigateQuestion(1, false);
                      }}
                    >
                      Not relevant
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
