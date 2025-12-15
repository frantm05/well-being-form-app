// Use API path that works with both Vite dev proxy and Netlify functions
export const API_URL = '/api/getQuestions';

export function groupQuestionsByCategory(items = []) {
  const grouped = items.reduce((acc, q) => {
    const cat = q.positiveEmotions || q.category || 'Uncategorized';
    const catId = q.categoryId || 999; // Use 999 as fallback for uncategorized
    
    if (!acc[cat]) {
      acc[cat] = { 
        title: cat, 
        categoryId: catId,
        questions: [] 
      };
    }
    
    acc[cat].questions.push({
      id: q._id || q.id,
      text: q.question || q.text || '',
      raw: q
    });
    return acc;
  }, {});

  // Sort categories by categoryId
  const sortedCategories = Object.entries(grouped)
    .sort(([, a], [, b]) => a.categoryId - b.categoryId)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  return sortedCategories;
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

// Add validation helper
const validateAnswers = (answers) => {
  if (!answers || typeof answers !== 'object') {
    throw new Error('Invalid answers format');
  }
  
  const sanitized = {};
  for (const [category, questions] of Object.entries(answers)) {
    if (typeof category !== 'string') continue;
    sanitized[category] = {};
    
    if (questions && typeof questions === 'object') {
      for (const [questionId, value] of Object.entries(questions)) {
        // Ensure value is a number between 0-10
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
          sanitized[category][questionId] = numValue;
        }
      }
    }
  }
  return sanitized;
};

export async function submitData(payload) {
  const API_URL = '/api/submitResponse'; 

  try {
    // Validate and sanitize payload - only send summary data
    const sanitizedPayload = {
      personalInfo: {
        firstName: sanitizeString(payload.personalInfo?.firstName || ''),
        age: sanitizeNumber(payload.personalInfo?.age || 0),
        gender: payload.personalInfo?.gender?.value ? 
          sanitizeString(payload.personalInfo.gender.value) : '',
        country: payload.personalInfo?.country?.value ? 
          sanitizeString(payload.personalInfo.country.value) : '',
        university: payload.personalInfo?.university?.value ? 
          sanitizeString(payload.personalInfo.university.value) : '',
        faculty: sanitizeString(payload.personalInfo?.faculty || ''),
        major: sanitizeString(payload.personalInfo?.major || '')
      },
      // Only send aggregated results, not individual answers
      results: {
        categoryScores: Array.isArray(payload.results?.categoryScores) ?
          payload.results.categoryScores.map(score => ({
            category: sanitizeString(score.category || ''),
            avg: Number(score.avg) || 0
          })) : [],
        overall: Number(payload.results?.overall) || 0
      }
      // Note: No answers object, no timestamp
    };

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedPayload),
    });

    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    return await res.json();
  } catch (error) {
    console.error('Submit error:', error);
    throw error;
  }
}

// Helper functions
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 100);
}

function sanitizeNumber(num) {
  const parsed = parseInt(num, 10);
  return isNaN(parsed) ? 0 : Math.max(0, Math.min(150, parsed));
}