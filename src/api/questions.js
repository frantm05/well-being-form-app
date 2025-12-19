// Use API path that works with both Vite dev proxy and Netlify functions
export const API_URL = '/api/getQuestions';

// Helper functions - moved to top
function sanitizeString(str, maxLength = 100) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

function sanitizeNumber(num) {
  const parsed = parseInt(num, 10);
  return isNaN(parsed) ? 0 : Math.max(0, Math.min(150, parsed));
}

// Validation helper - updated to handle flattened answers
const validateAnswers = (answers) => {
  if (!answers || typeof answers !== 'object') {
    throw new Error('Invalid answers format');
  }
  
  const sanitized = {};
  
  // Handle flattened format: { "categoryName_Q1": value }
  for (const [questionKey, value] of Object.entries(answers)) {
    if (typeof questionKey !== 'string') continue;
    
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      sanitized[questionKey] = numValue;
    } else if (value === '' || value === null || value === undefined) {
      // Allow empty values for "Not relevant" questions
      sanitized[questionKey] = '';
    }
  }
  
  return sanitized;
};

export function groupQuestionsByCategory(items = []) {
  const grouped = items.reduce((acc, q) => {
    const cat = q.positiveEmotions || q.category || 'Uncategorized';
    const catId = q.categoryId || 999;
    
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

export async function submitData(payload) {
  const SUBMIT_API_URL = '/api/submitResponse'; 

  try {
    // Validate and sanitize answers first
    const sanitizedAnswers = validateAnswers(payload.answers || {});

    // Build sanitized payload
    const sanitizedPayload = {
      personalInfo: {
        nickname: sanitizeString(payload.personalInfo?.nickname || ''),
        age: sanitizeNumber(payload.personalInfo?.age || 0),
        gender: sanitizeString(payload.personalInfo?.gender || ''),
        country: sanitizeString(payload.personalInfo?.country || ''),
        university: sanitizeString(payload.personalInfo?.university || '', 200),
        faculty: sanitizeString(payload.personalInfo?.faculty || ''),
        major: sanitizeString(payload.personalInfo?.major || '')
      },
      overallScore: Number(payload.overallScore) || 0,
      answers: sanitizedAnswers
    };

    console.log('Submitting sanitized payload:', sanitizedPayload);

    const res = await fetch(SUBMIT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedPayload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Submit error response:', res.status, errorText);
      throw new Error(`Submit failed: ${res.status} ${res.statusText}`);
    }
    
    const result = await res.json();
    console.log('Submit successful:', result);
    return result;
  } catch (error) {
    console.error('Submit error:', error);
    throw error;
  }
}