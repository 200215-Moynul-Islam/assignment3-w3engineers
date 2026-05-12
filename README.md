# Sanctuary Cap Cana Resort Page

A responsive resort property page served by an Express.js HTTP server. The project includes API-backed nearby property listings, a property image gallery, date range pricing, persistent favourites, and Google Maps integration.

## Features

- Responsive resort detail page built with HTML, CSS, and vanilla JavaScript.
- Express server for static files and JSON API endpoints.
- Property image gallery fetched from the server.
- Desktop gallery modal with locked background scrolling.
- Mobile image slider with next/previous controls, swipe gestures, and image counter.
- Expandable resort description with Show more / Show less behavior.
- Hotel Datepicker date range picker for check-in and check-out dates.
- Dynamic total price calculation from selected nights.
- Nearby Properties dropdown for Most Popular, Highest Price, and Lowest Price results.
- Persistent favourite properties using `localStorage`.
- Google Maps markers for displayed nearby properties.

## Tech Stack

- Node.js
- Express.js
- HTML5, CSS3, Vanilla JavaScript
- Hotel Datepicker
- Google Maps JavaScript API
- dotenv

## Project Structure

```text
.
|-- data/
|   |-- highest_price.json
|   |-- lowest_price.json
|   `-- most_popular.json
|-- images/
|   |-- aibr-logo.png
|   |-- booking.com.png
|   `-- sanctuary-cap-cana/
|       |-- 1.jpg
|       |-- ...
|       `-- 10.jpg
|-- public/
|   |-- index.css
|   |-- index.html
|   `-- scripts/
|       |-- about.js
|       |-- gallary-modal.js
|       `-- gallery.js
|-- .env.example
|-- package-lock.json
|-- package.json
|-- README.md
`-- server.js
```

## Requirements

- Node.js 18 or newer
- npm
- Google Maps API key with **Maps JavaScript API** enabled

## Run Locally

Clone the project:

```bash
git clone https://github.com/200215-Moynul-Islam/assignment3-w3engineers.git
cd assignment3-w3engineers
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update `.env`:

```env
PORT=3000
BASE_URL=http://localhost:3000
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

> ⚠️ Note: The server must run on port **3000**. Do not change the `PORT` value and the BASE_URL. The port number is already used in the frontend so we can not change the port number.

Start the server:

```bash
node server.js
```

Open the project in your browser:

```text
http://localhost:3000
```

The project must be opened through the local server. Opening `public/index.html` directly will not work correctly because the page depends on server API endpoints.

## Environment Variables

| Variable              | Description                            | Example                 |
| --------------------- | -------------------------------------- | ----------------------- |
| `PORT`                | Port used by the local Express server. | `3000`                  |
| `BASE_URL`            | Base URL for the local app.            | `http://localhost:3000` |
| `GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key.        | `AIza...`               |
