export async function handler(event, context) {
  // Add CORS headers for preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: '',
    };
  }

  try {
    const queryParams = event.queryStringParameters || {};
    const urlParams = new URLSearchParams(queryParams);
    const apiUrl = `http://universities.hipolabs.com/search?${urlParams.toString()}`;
    
    console.log('Fetching from Universities API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Universities API error:', response.status, errorText);
      throw new Error(`Universities API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Data received from Universities API');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error in getUniversities function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: error.message,
        details: 'Failed to fetch universities'
      }),
    };
  }
}