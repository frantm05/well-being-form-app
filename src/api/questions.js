// Use API path that works with both Vite dev proxy and Netlify functions
export const API_URL = '/api/getQuestions';

export function groupQuestionsByCategory(items = []) {
  return items.reduce((acc, q) => {
    const cat = q.positiveEmotions || q.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = { title: cat, questions: [] };
    acc[cat].questions.push({
      id: q._id || q.id,
      text: q.question || q.text || '',
      raw: q
    });
    return acc;
  }, {});
}

export async function fetchQuestions() {
  try {
    console.log('Fetching questions from:', API_URL);
    const res = await fetch(API_URL, { 
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Fetch error:', res.status, errorText);
      throw new Error(`Network response was not ok: ${res.status} ${res.statusText}`);
    }
    
    const parsed = await res.json();
    console.log('Questions received:', parsed);
    const items = Array.isArray(parsed) ? parsed : (parsed.body || parsed.items || []);
    return groupQuestionsByCategory(items);
  } catch (error) {
    console.error('fetchQuestions error:', error);
    throw error;
  }
}
