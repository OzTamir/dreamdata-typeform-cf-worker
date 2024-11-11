# Typeform Worker

A Cloudflare Worker that handles Typeform response fetching and integrates with Dreamdata tracking.

## Prerequisites

- Node.js installed (v16 or later recommended)
- A Cloudflare account
- A Typeform account and API key
- Your Typeform form ID

## Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Configure your Typeform form ID in `wrangler.toml`:

```toml
[vars]
TYPEFORM_FORM_ID = "your_form_id"
```

3. Set up your Typeform API key as a secret:

```bash
npx wrangler secret put TYPEFORM_API_KEY
```

## Development

To run the worker locally:

```bash
npm run dev
```

## Deployment

To deploy to Cloudflare Workers:

```bash
npm run deploy
```

## Usage

After deployment, update your frontend code to use the worker:

```javascript
createPopup("<your-form-id>", {
  onSubmit: async ({ formId, responseId }) => {
    try {
      const res = await fetch(
        `https://typeform-worker.<your-worker>.workers.dev/fetch-response/${responseId}`
      );
      const data = await res.json();
      const email = data.email;

      if (email) {
        dreamdata.track("Requested Demo");
        dreamdata.identify(null, { email });
      }
    } catch (error) {
      console.error("Error tracking form submission:", error);
    }
  },
});
```

## Project Structure

- `src/worker.ts` - Main worker code
- `wrangler.toml` - Cloudflare Worker configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Project dependencies and scripts

## Environment Variables

- `TYPEFORM_API_KEY` - Your Typeform API key (set as a secret)
- `TYPEFORM_FORM_ID` - Your Typeform form ID (set in wrangler.toml)

## API Endpoints

### GET /fetch-response/:responseId

Fetches a Typeform response by ID and returns the email field.

**Response Format:**

```json
{
  "email": "user@example.com"
}
```

## Error Handling

The worker returns appropriate HTTP status codes:

- 400 - Invalid path
- 500 - Server error or Typeform API error

## Development Notes

- Make sure to rename any existing `worker.js` to `worker.ts`
- The worker uses TypeScript for better type safety
- CORS is enabled for all origins (\*)
