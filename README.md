# jovo-webhook-debugger

The Jovo Webhook+Debugger allows you to test your Jovo app without uploading your code to a server.

## Description

A self-hosted alternative to the Jovo Webhook service, allowing you to debug and test your Jovo voice and chat applications locally.


## Setup

```bash
npm run setup
```

This command will install all necessary dependencies in /backend and /frontend. It also builds the frontend and moves it to /backend/public.

## Start

```bash
npm run start:backend
```

The webhook server will start on:
- Default port: 4000
- Webhook URL: `http://localhost:4000`
- Debugger interface: `http://localhost:4000/<your-id>`

### Update Jovo Debugger URL in your Jovo project

Update the `webhookUrl` in your Jovo Debugger plugin configuration in your `app.dev.ts` file:

```typescript
app.configure({
  plugins: [
    ///...
    new JovoDebugger({
      webhookUrl: 'http://localhost:4000',
    }),
  ],
});
```

Run your Jovo project with `jovo run` or `npm run start:dev`. Go to provided URL in your browser to test your application.

## Features

- Local webhook endpoint for Jovo applications
- Built-in debugger interface
- Request/response logging
- Real-time testing capabilities

### Use ngrok

If you want to test your application with a public webhook URL, you can use [ngrok](https://ngrok.com/).

```bash
ngrok http 4000
```

Update the `webhookUrl` in your Jovo Debugger plugin configuration in your `app.dev.ts` file.

```javascript
app.configure({
  plugins: [
    ///...
    new JovoDebugger({
      webhookUrl: 'https://<your-ngrok-url>',
    }),
  ],
});
```

## Docker

```sh
docker compose up -d
```