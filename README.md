# Phonebook backend

This is a simple Node/Express backend for the Phonebook app (Full Stack Open, part 3, steps 3.1–3.10).

## Local development

- Install dependencies: `npm install`
- Start dev server (auto-restart): `npm run dev`
- Start production server: `npm start`
- Base URL: `http://localhost:3001`
  - `GET /api/persons`
  - `GET /api/persons/:id`
  - `POST /api/persons`
  - `DELETE /api/persons/:id`
  - `GET /info`

## Deployed backend

- Live URL: <ADD_YOUR_RENDER_URL_HERE>

## Deploying to Render

1. Push this project to a Git repository (GitHub/GitLab/Bitbucket).
2. Create a new Web Service in Render.
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment: `NODE_ENV=production`
3. Alternatively, add this repo with `render.yaml` to Render Blueprint and click “New + → Blueprint Instance”.
4. After deploy, test endpoints using the live URL, e.g. `GET <LIVE_URL>/api/persons`.
