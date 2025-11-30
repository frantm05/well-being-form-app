import { useEffect, useReducer } from "react";
import { reducer } from "../state/reducer";
import { fetchQuestions } from "../api/questions";
const initialState = {
  categories: {},
  answers: {},
  submitting: false,
  submitted: false,
  results: null,
  loadingError: null,
  currentCategoryKey: null,
  currentQuestionIndex: 0,
};

export function useWellBeing() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const grouped = await fetchQuestions();
        if (!cancelled) {
          dispatch({ type: "SET_CATEGORIES", payload: grouped });
          const firstCategoryKey = Object.keys(grouped)[0];
          if (firstCategoryKey) {
            dispatch({
              type: "SET_CURRENT_SELECTION",
              payload: { categoryKey: firstCategoryKey, questionIndex: 0 },
            });
          }
        }
      } catch (err) {
        console.error("Fetch error", err);
        if (!cancelled) dispatch({ type: "SET_ERROR", payload: String(err) });
      }
    };
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const { categories, answers, currentCategoryKey, currentQuestionIndex } =
    state;

  const onSubmit = async () => {
    dispatch({ type: "SUBMIT_START" });
    try {
      const categoryScores = Object.keys(categories).map((catKey) => {
        const qs = categories[catKey].questions;
        const sum = qs.reduce(
          (s, q) => s + (answers?.[catKey]?.[q.id] ?? 0),
          0
        );
        const avg = qs.length ? sum / qs.length : 0;
        return { category: catKey, sum, avg };
      });
      const overall = categoryScores.reduce((s, c) => s + c.sum, 0);
      dispatch({ type: "SUBMIT_DONE", payload: { categoryScores, overall } });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: String(err) });
    }
  };

  const handleSelectQuestion = (categoryKey, questionIndex) => {
    dispatch({
      type: "SET_CURRENT_SELECTION",
      payload: { categoryKey, questionIndex },
    });
  };

  const handleAnswerChange = (category, questionId, value) => {
    dispatch({ type: "SET_ANSWER", payload: { category, questionId, value } });
  };

  const navigateQuestion = (direction) => {
    const categoryKeys = Object.keys(categories);
    const currentCategoryIndex = categoryKeys.indexOf(currentCategoryKey);
    const currentCategory = categories[currentCategoryKey];

    if (!currentCategory) return;

    let nextIndex = currentQuestionIndex + direction;

    // If moving forward beyond current category
    if (nextIndex >= currentCategory.questions.length && direction > 0) {
      const nextCategoryIndex = currentCategoryIndex + 1;
      if (nextCategoryIndex < categoryKeys.length) {
        handleSelectQuestion(categoryKeys[nextCategoryIndex], 0);
      }
      return;
    }

    // If moving backward before current category
    if (nextIndex < 0 && direction < 0) {
      const prevCategoryIndex = currentCategoryIndex - 1;
      if (prevCategoryIndex >= 0) {
        const prevCategory = categories[categoryKeys[prevCategoryIndex]];
        handleSelectQuestion(
          categoryKeys[prevCategoryIndex],
          prevCategory.questions.length - 1
        );
      }
      return;
    }

    // Normal navigation within category
    if (nextIndex >= 0 && nextIndex < currentCategory.questions.length) {
      handleSelectQuestion(currentCategoryKey, nextIndex);
    }
  };

  return {
    state,
    handleSelectQuestion,
    handleAnswerChange,
    navigateQuestion,
    onSubmit,
  };
}