// Use relative path for both dev and production - works with Vite proxy and Netlify redirects
export const API_URL = '/api/questions';

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
