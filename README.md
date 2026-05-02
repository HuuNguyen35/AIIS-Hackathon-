# HandsOnDeck

A real-time disaster response platform that connects disabled individuals with neighbors and first responders during emergencies.

## The Problem

Disabled individuals are disproportionately affected during natural disasters. Existing emergency systems assume mobility and communication ability that many people do not have. When a flood watch hits, a person in a wheelchair on the 3rd floor cannot simply walk out. They need someone to come to them, and that someone needs to know exactly where they are, what disabilities they have, and what medications they depend on.

## How It Works

1. Disabled individuals register with their address, floor, disability type, medications, and neighbor phone numbers
2. When a flood watch is detected (or simulated), the system sends SMS alerts to all registered users
3. A user who needs help taps "I Need Help" in the app
4. The system immediately sends Twilio SMS and Vapi AI phone calls to all their registered neighbors
5. The neighbor receives a call and text with the person's full profile and a link to respond
6. The neighbor opens the link, sees the person's details, and taps "I Am On My Way"
7. The disabled person's app updates in real time to show "Help is on the way"
8. When the neighbor arrives, they submit a condition report and mark the person safe
9. The first responder dashboard updates in real time showing all case statuses

## Tech Stack

- **Node.js / Express** -- Backend API server
- **Twilio SMS** -- Text message alerts to users and neighbors
- **Vapi AI** -- Automated phone calls to neighbors with emergency details
- **NWS Weather API** -- Real-time National Weather Service alert polling
- **Leaflet** -- Map visualization in responder dashboard
- **ngrok** -- Public tunnel for local development and demo

## Three User Roles

**Disabled Individual** -- Registers their profile with disability, medications, floor number, and neighbor contacts. Receives flood alerts and can request help with one tap. Sees real-time status updates as neighbors respond.

**Neighbor / Volunteer** -- Receives automated phone calls and SMS when a nearby disabled person needs help. Opens the app to see the person's full profile, confirms they are on the way, and submits a condition report on arrival.

**First Responder** -- Views a live dashboard of all cases sorted by urgency. Sees which cases are uncontacted, which have neighbors en route, and which are resolved. Can trigger simulated flood watches for testing.

## Demo

Three hardcoded demo pages for live presentation. No registration needed.

- `/demo/anh` -- Disabled person. Sees idle screen, then flood alert overlay when triggered. Can request help or mark safe.
- `/demo/tin` -- First responder dashboard. Shows live case list, simulate flood watch button, reset button.
- `/demo/gavin` -- Neighbor. Auto-detects when Anh needs help. Shows her profile, can confirm en route, submit condition report, mark safe.

These pages are hardcoded to the `demo-anh` user record and poll every 3 seconds.

## Setup

```
git clone https://github.com/HuuNguyen35/AIIS-Hackathon-.git
cd AIIS-Hackathon-
npm install
```

Create a `.env` file in the project root:

```
VAPI_API_KEY=your_vapi_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE=+1your_twilio_number
BASE_URL=https://your-ngrok-url.ngrok-free.app
```

Start the server:

```
node server.js
```

In a separate terminal, expose with ngrok:

```
ngrok http 3000
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VAPI_API_KEY` | Vapi API key for automated phone calls |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE` | Twilio phone number (E.164 format) |
| `BASE_URL` | Public ngrok URL for SMS links |
| `PORT` | Server port (default 3000) |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| GET | `/app` | Mobile web app |
| GET | `/v2` | Multi-role web app |
| GET | `/neighbor` | Neighbor response page |
| GET | `/demo/anh` | Demo: disabled person |
| GET | `/demo/tin` | Demo: first responder |
| GET | `/demo/gavin` | Demo: neighbor |
| POST | `/register` | Register a new user |
| POST | `/status` | Update user status and transcript |
| GET | `/users` | List all users (optional `?status=` filter) |
| GET | `/users/:id` | Get a single user by ID |
| PUT | `/users/:id` | Update user profile |
| PATCH | `/users/:id/neighbors` | Add a neighbor phone number |
| GET | `/transcripts` | List users with transcripts |
| GET | `/alert` | Get current active alert |
| POST | `/alert/clear` | Clear the active alert |
| POST | `/notify/:id` | Send SMS and Vapi call to user's neighbors |
| POST | `/test-trigger` | Simulate a flood watch alert |
| POST | `/reset` | Reset all users to safe, clear alert |
| POST | `/push-token` | Register push notification token |
| POST | `/webhook/vapi` | Vapi end-of-call webhook |

## Team
