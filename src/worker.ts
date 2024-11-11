/// <reference types="@cloudflare/workers-types" />

export interface Env {
  TYPEFORM_API_KEY: string;
  TYPEFORM_FORM_ID: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url);

    // Extract responseId from the URL path
    const match = url.pathname.match(/\/fetch-response\/(.+)/);
    if (!match) {
      return new Response("Invalid path", { status: 400 });
    }

    const responseId = match[1];

    try {
      // Fetch the response from Typeform API
      const typeformResponse = await fetch(
        `https://api.typeform.com/forms/${env.TYPEFORM_FORM_ID}/responses/${responseId}`,
        {
          headers: {
            Authorization: `Bearer ${env.TYPEFORM_API_KEY}`,
          },
        }
      );

      if (!typeformResponse.ok) {
        throw new Error(`Typeform API error: ${typeformResponse.statusText}`);
      }

      const data = await typeformResponse.json() as any;

      console.log(data);

      // Find the email field in the response
      const answers = data.items?.[0]?.answers || [];
      const emailField = answers.find(
        (answer: any) => answer.field.type === "email"
      );
      const email = emailField?.email || null;

      // Return the response with CORS headers
      return new Response(JSON.stringify({ email }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Error fetching Typeform response:", error);
      return new Response(
        JSON.stringify({ error: "Error fetching response" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
