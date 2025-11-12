export function reducer(state, action) {
  switch (action.type) {
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_ANSWER':
      {
        const { category, questionId, value } = action.payload;
        const next = { ...state.answers };
        if (!next[category]) next[category] = {};
        next[category][questionId] = value;
        return { ...state, answers: next };
      }
    case 'SET_CURRENT_SELECTION':
      return {
        ...state,
        currentCategoryKey: action.payload.categoryKey,
        currentQuestionIndex: action.payload.questionIndex,
      };
    case 'SUBMIT_START':
      return { ...state, submitting: true };
    case 'SUBMIT_DONE':
      return { ...state, submitting: false, submitted: true, results: action.payload };
    case 'SET_ERROR':
      return { ...state, loadingError: action.payload, submitting: false };
    default:
      return state;
  }
}
