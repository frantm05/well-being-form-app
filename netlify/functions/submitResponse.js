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

  // Validate answers
  if (!data.answers || typeof data.answers !== 'object') {
    throw new Error('Invalid answers format');
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
    const WIX_API_URL = 'https://www.uniwellsity.com/_functions/submitResponse';

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

        console.log("Received data:", JSON.stringify(data, null, 2));

        // Validate payload
        validatePayload(data);

        // Sanitize data - keep original field IDs from Wix
        const sanitizedData = {
            personalInfo: {
                nickname: sanitizeString(data.personalInfo?.nickname || ''),
                age: Math.max(0, Math.min(150, parseInt(data.personalInfo?.age, 10) || 0)),
                gender: sanitizeString(data.personalInfo?.gender || ''),
                country: sanitizeString(data.personalInfo?.country || ''),
                university: sanitizeString(data.personalInfo?.university || '', 200),
                faculty: sanitizeString(data.personalInfo?.faculty || ''),
                major: sanitizeString(data.personalInfo?.major || '')
            },
            overallScore: Number(data.overallScore) || 0,
            // Keep the original field IDs from the database
            answers: Object.entries(data.answers || {}).reduce((acc, [key, value]) => {
                // Don't modify the key - use it as-is from the database
                const numValue = Number(value);
                if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
                    acc[key] = numValue;
                } else if (value === '' || value === null || value === undefined) {
                    acc[key] = '';
                }
                return acc;
            }, {})
        };

        console.log("Sending sanitized data to Wix:", JSON.stringify(sanitizedData, null, 2));

        // Forward to Wix
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
        console.log("Wix response:", responseData);

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
