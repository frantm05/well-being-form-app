export async function handler(event, context) {
  //const WIX_API_URL = 'https://matejfrantik.wixsite.com/well-being-form/_functions/getQuestions';
  const WIX_API_URL = 'https://www.uniwellsity.com/_functions/getQuestions';

  // Add CORS headers for preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: '',
    };
  }

  try {
    console.log('Fetching from Wix API:', WIX_API_URL);
    
    const response = await fetch(WIX_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Wix API error:', response.status, errorText);
      throw new Error(`Wix API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Data received from Wix API');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error in getQuestions function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: error.message,
        details: 'Failed to fetch questions from Wix API'
      }),
    };
  }
}