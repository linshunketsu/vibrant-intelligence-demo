<div align="center">
  <h1>Vibrant Intelligence</h1>
  <p>An AI-powered, lab-integrated platform built for how clinics actually work.</p>
</div>

## Overview

Vibrant Intelligence is a demo prototype showcasing a modern clinical workflow platform with:

- **Patient Management** - Comprehensive patient records with workflow tracking
- **Encounter Notes & AI Composer** - AI-assisted clinical documentation with real-time transcription
- **Form Builder** - Drag-and-drop form creator with AI-powered field generation and EHR mapping
- **Practice Management** - Dashboard for clinic metrics, appointments, and resources
- **Workbench** - Workflow editor with visual automation tools

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Google Gemini API (AI features)

## Getting Started

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [`.env.local`](.env.local) to your Gemini API key

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3001

## Features

### My Patients
- Patient list with workflow status tracking
- Peg board for quick access to active patients
- Pin important patient records

### Encounter Notes
- Real-time transcription capture
- AI Composer for generating clinical summaries
- Smart templates (SOAP notes, progress notes, etc.)
- Clinical objects integration (eRx, orders, workflows)

### Form Builder
- Drag-and-drop form creation
- AI-powered form generation
- Auto EHR field mapping suggestions
- Composite field components (Personal Info, Health Insurance, Vitals)
- Template library

### My Practice
- Dashboard with key metrics
- Appointment management
- Resource and tools shortcuts
- Provider settings

### My Workbench
- Visual workflow editor
- Automation triggers and actions
- Integration with clinical systems

## License

Demo prototype for Vibrant Wellness.
