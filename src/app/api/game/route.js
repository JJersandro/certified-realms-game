import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from 'groq-sdk';

// Initialize AI services with their keys.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper function to format messages for the Gemini API.
function formatMessagesForGemini(messages) {
  const geminiMessages = [];
  let userContent = "";

  for (const message of messages) {
    if (message.role === "system" || message.role === "user") {
      userContent += message.content + "\n\n";
    } else if (message.role === "model") {
      if (userContent) {
        geminiMessages.push({
          role: "user",
          parts: [{ text: userContent.trim() }]
        });
        userContent = "";
      }
      geminiMessages.push({
        role: "model",
        parts: [{ text: message.content.trim() }]
      });
    }
  }

  if (userContent) {
    geminiMessages.push({
      role: "user",
      parts: [{ text: userContent.trim() }]
    });
  }
  return geminiMessages;
}

const gameLore = `
### Game Narrative & Core Mechanics
1. Prologue: The player, Cloud Vanguard, is pulled into a world called Certifica.
2. Core Objective: Master domains of knowledge (certifications) to restore balance.
3. Enemies & Allies: Initial enemies are the Patchling Horde. A key opponent is Naruto Defender, who can be recruited after 5 defeats.
4. Game Flow: Combat is knowledge-based. Correct answers grant CertPoints, ActivityPoints, and XP. Leveling up unlocks new Traits.
`;

const characterData = `
### Player and Character Data
Player Name: You will receive the player's name.
Naruto Defender Character Sheet:
- Name: Naruto Defender
- Role: Strategic Attacker / Support
- Cert Focus: Microsoft 365 Security, Zero Trust, Conditional Access
- Stats: Level 1, HP 120, DP 15-25, 0 CP/AP/XP.
- Traits: Zero Trust Rasengan (+20% damage), Shadow Clone MFA (absorbs 1 attack), Compliance Burden (-10% AP efficiency), Leaf Sync (+5% XP gain).
- Special Moves: Zero Trust Rasengan (2 AP), Shadow Clone MFA (3 AP), Policy Seal (1 AP), Leaf Firewall (2 AP).
`;

const combatScenarios = `
### Battle Scenario: Patchling Horde – "The First Firewall"
- Location: Corrupted Meadow of LegacyCode
- Enemies:
    - Patchling.EXE: HP 40, Weakness: Azure Fundamentals.
    - Patchling.DLL: HP 50, Weakness: Microsoft 365 Security.
    - Patchling.BAT: HP 60, Weakness: Identity & Access.
`;

const responseProtocol = `
### AI Response Protocol
Your responses must be in a strictly JSON format.
{
  "question": "[The next part of the story or a new question for the user]",
  "feedback": "[Feedback on the user's action or answer]",
  "score": [The points (int) the user earns],
  "options": [
    "[Option A]",
    "[Option B]",
    "[Option C]",
    "[Option D]"
  ]
}
If a question requires a free-text answer (not an exam-style question), the "options" array MUST be empty.
`;

const gameSystemPrompt = `
You are the master game engine for "Certified Realms – The Azure Awakening". Your persona is an all-knowing, dynamic AI that narrates and manages a gamified learning platform for Microsoft certifications. Your primary goal is to create an immersive, responsive, and educational experience.

${gameLore}
${characterData}
${combatScenarios}
${responseProtocol}

### Special Rules
- Multiple-Choice Questions: You MUST provide a populated \`options\` array.
- Narrative/Action-Based Responses: The \`options\` array MUST be empty.
- Interpreting User Input: Interpret user intent and offer suggestions in the "question" field. Example: "Did you want to /investigate the area or /ask Clippy for advice?"
- Consistency: Use the provided character names, locations, and game mechanics consistently.
- Clarity: Keep text visually appealing and easy to read.
`;

export async function POST(request) {
  const { action, answer, current_state, player_name } = await request.json();

  let gameResponse;
  let parsedResponse = null;
  let usedModel = "Gemini";

  let messages = [];

  if (action === "start_game") {
    messages = [
      {
        role: "system",
        content: gameSystemPrompt
      },
      {
        role: "user",
        content: `
          **Role:** Je bent de game master van Certified Realms.
          **Instructie:** De gebruiker heet "${player_name}". Begin het spel met de proloog en leidt de speler de magische wereld van Certifica binnen. Introduceer Clippy de Wijze en de eerste missie tegen de Patchling Horde.
          Stel vervolgens de eerste meerkeuzevraag over Azure Fundamentals, zoals beschreven in de prompt. Zorg voor een correcte JSON-structuur met een bevolkte \`options\` array.
        `
      }
    ];
  } else if (action === "answer_question") {
    let userPrompt;
    if (answer && answer.startsWith('/')) {
        // Command or special action
        const command = answer.substring(1).trim();
        userPrompt = `De speler, ${player_name}, heeft de actie "${command}" ingevoerd. Interpreteer de intentie en reageer passend op de verhaallijn. Geef suggesties als het commando onduidelijk is.`;
    } else if (current_state && current_state.options && current_state.options.includes(answer)) {
        // Multiple-choice question answered
        userPrompt = `De speler, ${player_name}, heeft "${answer}" gekozen. Evalueer het antwoord op basis van de quiz in de prompt. Update de verhaallijn, score en geef de volgende vraag of het resultaat van het gevecht.`;
    } else {
        // Free-text input
        userPrompt = `De speler, ${player_name}, heeft het antwoord of de actie "${answer}" gegeven. Als het een antwoord is op een technische vraag, geef dan de juiste feedback en punten. Als het een actie of communicatie is, reageer dan op een dynamische manier. Probeer onduidelijke antwoorden te begrijpen en geef nuttige suggesties.`;
    }

    messages = [
      {
        role: "system",
        content: gameSystemPrompt
      },
      {
        role: "user",
        content: `
          **Role:** Je bent de game master van Certified Realms.
          **Instructie:** ${userPrompt}
          ${current_state ? 'De huidige status van de game is: ' + JSON.stringify(current_state) : ''}
          Genereer de volgende stap in het spel in een strikt JSON formaat. De JSON-structuur moet het volgende bevatten:
          {
            "question": "[De volgende vraag of verhaallijn]",
            "feedback": "[Feedback op de actie van de gebruiker]",
            "score": [De punten (int) die de gebruiker verdient (0 voor een fout antwoord)],
            "options": [
              "[Optie 1]",
              "[Optie 2]",
              "[Optie 3]",
              "[Optie 4]"
            ]
          }
          Als de vraag een vrije tekstinvoer vereist (geen Microsoft exam-gerelateerde vraag), zorg er dan voor dat de "options" array leeg is.
          Geef de vraag en feedback in een visueel aantrekkelijke, leesbare stijl.
        `
      }
    ];
  }

  try {
    console.log("Poging tot aanroep van de Gemini API...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const result = await model.generateContent({
      contents: formatMessagesForGemini(messages)
    });
    const response = await result.response;
    gameResponse = response.text();
    
    try {
      parsedResponse = JSON.parse(gameResponse);
    } catch (parseError) {
      console.error("Fout bij het parsen van de Gemini-respons:", parseError);
      console.error("Ruwe respons van Gemini:", gameResponse);
      return new Response(JSON.stringify({
        question: "Er is een fout opgetreden. De AI gaf een ongeldige respons.",
        feedback: "Excuses, de AI begrijpt het JSON-formaat niet meer. Dit kan gebeuren bij complexe verzoeken. Probeer opnieuw te starten.",
        score: 0,
        options: []
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (geminiError) {
    console.error("Fout bij het aanroepen van de Gemini API:", geminiError);
    usedModel = "Groq";
    console.log("Overschakelen naar de Groq API...");

    try {
      const completion = await groq.chat.completions.create({
        messages: messages,
        model: "llama3-8b-8192", 
        response_format: { type: "json_object" }
      });
      gameResponse = completion.choices[0].message.content;
      
      try {
        parsedResponse = JSON.parse(gameResponse);
      } catch (parseError) {
        console.error("Fout bij het parsen van de Groq-respons:", parseError);
        console.error("Ruwe respons van Groq:", gameResponse);
        return new Response(JSON.stringify({
          question: "Er is een fout opgetreden. De AI gaf een ongeldige respons.",
          feedback: "Excuses, de AI begrijpt het JSON-formaat niet meer. Probeer opnieuw te starten.",
          score: 0,
          options: []
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (groqError) {
      console.error("Fout bij het aanroepen van de Groq API:", groqError);
      return new Response(JSON.stringify({ error: "Interne serverfout. Geen van de AI's reageerde." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (parsedResponse) {
    return new Response(JSON.stringify({
      question: parsedResponse.question,
      feedback: parsedResponse.feedback || "",
      score: parsedResponse.score || 0,
      options: parsedResponse.options || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    console.error("Fout: De AI-respons is leeg of ongeldig.", parsedResponse);
    return new Response(JSON.stringify({
      question: "Er is een fout opgetreden. Probeer het opnieuw.",
      feedback: "De AI gaf een ongeldige respons.",
      score: 0,
      options: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}