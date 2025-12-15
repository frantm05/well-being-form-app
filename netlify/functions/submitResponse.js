// Validation helpers
const sanitizeString = (str, maxLength = 100) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
};

const validatePayload = (data) => {
  // Validate personal info
  if (!data.personalInfo || typeof data.personalInfo !== 'object') {
    throw new Error('Invalid personal info');
  }

  // Validate results
  if (!data.results || typeof data.results !== 'object') {
    throw new Error('Invalid results format');
  }

  // Check for suspicious patterns
  const jsonString = JSON.stringify(data);
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /eval\(/i,
    /alert\(/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(jsonString)) {
      throw new Error('Suspicious content detected');
    }
  }

  return true;
};

export async function handler(event, context) {
    const WIX_API_URL = 'https://matejfrantik.wixsite.com/well-being-form/_functions/submitResponse';

    // Handle preflight OPTIONS request
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
            },
            body: "",
        };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // Parse and validate input
        let data;
        try {
            data = JSON.parse(event.body);
        } catch (e) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid JSON' })
            };
        }

        // Validate payload
        validatePayload(data);

        // Sanitize and restructure data - only send summary, not full answers
        const sanitizedData = {
            personalInfo: {
                firstName: sanitizeString(data.personalInfo?.firstName || ''),
                age: Math.max(0, Math.min(150, parseInt(data.personalInfo?.age, 10) || 0)),
                gender: sanitizeString(data.personalInfo?.gender || ''),
                country: sanitizeString(data.personalInfo?.country || ''),
                university: sanitizeString(data.personalInfo?.university || '', 200),
                faculty: sanitizeString(data.personalInfo?.faculty || ''),
                major: sanitizeString(data.personalInfo?.major || '')
            },
            results: {
                categoryScores: data.results?.categoryScores?.map(score => ({
                    category: sanitizeString(score.category || ''),
                    avg: Number(score.avg) || 0
                })) || [],
                overall: Number(data.results?.overall) || 0
            }
            // Note: No timestamp, no full answers JSON
        };

        console.log("Sending sanitized data to Wix API (without full answers and timestamp)");

        // Přeposlání dat na Wix
        const response = await fetch(WIX_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(sanitizedData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Wix API submit error:", response.status, errorText);
            throw new Error(
                `Wix API error: ${response.status} ${response.statusText}`
            );
        }

        const responseData = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(responseData),
        };
    } catch (error) {
        console.error("Error in submitResponse function:", error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                error: "Validation or processing error",
                details: error.message,
            }),
        };
    }
}
