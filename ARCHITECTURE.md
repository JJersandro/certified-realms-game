# Flame Game — Architecture Baseline

## Current technical baseline
The repository currently contains a Next.js application with a client-side game screen and a server API route. The existing route calls Gemini first and Groq as fallback. The current implementation is prototype-level and is not yet the canonical architecture. fileciteturn3file0 fileciteturn4file0

## Target boundaries

### 1. Presentation
React/Next.js UI. Responsible for rendering state and collecting player input. It must not own canonical game rules.

### 2. Game state
Deterministic state model representing the authoritative current game state.

### 3. Game rules
Pure/domain logic for combat, progression, scoring, rewards, encounters, and validation.

### 4. Game data
Versioned Certified Realms data and other approved game content.

### 5. AI/content providers
Replaceable interfaces for narrative, questions, interpretation, and adaptive content. Providers can include Gemini, Groq, other models, or deterministic generators.

### 6. Persistence
Save/load mechanism for player and game state.

## Critical boundary
AI output is content/input to the game engine, not the game engine itself. Model output must be validated and constrained before affecting authoritative state.

## Migration principle
Do not rewrite everything at once. First make the current project runnable and observable. Then extract state, rules, and data behind stable boundaries incrementally.
