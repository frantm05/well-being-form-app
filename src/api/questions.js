// Use dev proxy path during development, otherwise call the Wix function URL directly.
export const API_URL = import.meta.env.DEV
  ? '/api/questions'
  : 'https://matejfrantik.wixsite.com/well-being-form/_functions/getQuestions';

export function groupQuestionsByCategory(items = []) {
  return items.reduce((acc, q) => {
    const cat = q.categoryName || q.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = { title: cat, questions: [] };
    acc[cat].questions.push({
      id: q._id || q.id,
      text: q.questionText || q.text || '',
      raw: q
    });
    return acc;
  }, {});
}

export async function fetchQuestions() {
  const res = await fetch(API_URL, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Network response was not ok: ${res.statusText}`);
  }
  const parsed = await res.json();
  const items = Array.isArray(parsed) ? parsed : (parsed.body || parsed.items || []);
  return groupQuestionsByCategory(items);
}
