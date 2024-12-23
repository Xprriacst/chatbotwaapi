# WhatsApp Chat Application

A React-based WhatsApp chat application that integrates with the WAAPI service.

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Update the `.env` file with your WAAPI credentials
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Start the webhook server (in a separate terminal):
   ```bash
   npm run webhook
   ```

## Environment Variables

When deploying to Netlify, add these environment variables in the Netlify dashboard:

- `VITE_WAAPI_ACCESS_TOKEN`: Your WAAPI access token
- `VITE_WAAPI_INSTANCE_ID`: Your WAAPI instance ID
- `VITE_WAAPI_PHONE_NUMBER`: Your WhatsApp Business phone number
- `VITE_WAAPI_BASE_URL`: WAAPI base URL (https://waapi.app/api/v1)

## Development

- Frontend code is in the `src` directory
- Webhook server is in `src/server`
- Environment configuration is in `src/config`

## Production Build

```bash
npm run build
```

## License

MIT