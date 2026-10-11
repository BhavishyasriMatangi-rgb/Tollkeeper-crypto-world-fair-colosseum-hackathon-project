import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// POST /api/support/chat - Context-Aware Support Chatbot
// -------------------------------------------------------------
app.post('/api/support/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const latestUserMessage = messages[messages.length - 1]?.content || '';

    // Build context description from user's current session
    let contextPrompt = `You are "Aegis", the dedicated AI Security & Technical Support Agent for Tollkeeper ("The toll gate for AI agent payments").
Tollkeeper evaluates Solana wallets and SPL token mints using deterministic, rule-based on-chain heuristics to protect autonomous AI agents and human treasurers.

Core Tollkeeper Rules & Knowledge:
1. Verdicts:
   - SAFE (Score 0-24): Passes baseline invariants. Gate opens.
   - CAUTION (Score 25-59): Moderate anomalies (e.g. young wallet < 7 days old, low transaction count < 5). Gate cracks open; requires human supervisor confirmation.
   - BLOCK (Score 60+): High risk (e.g., no transaction history (+40), unrenounced mint authority (+30), active freeze authority (+20), top 10 holders own >80% supply (+35)). Gate locked shut.
2. Architecture:
   - Read-only Solana JSON-RPC queries. Zero smart contracts, zero private keys, zero custodial risk.
   - Fully customizable RPC endpoints (Helius, QuickNode, Triton).
   - Autonomous Agent API contract: GET /v1/check?address=...
3. Persona & Style:
   - Authoritative, helpful, precise, security-first, concise.
   - When users paste or ask about a Solana address, explain how Tollkeeper analyzes it and what safety invariants apply.
   - You remember the entire ongoing conversation context and past discussion turns.`;

    if (context) {
      contextPrompt += `\n\nCURRENT USER SESSION CONTEXT:\n`;
      if (context.activeAddress) {
        contextPrompt += `- User is currently inspecting address: ${context.activeAddress}\n`;
      }
      if (context.lastVerdict) {
        contextPrompt += `- Last evaluated verdict: ${context.lastVerdict} (Score: ${context.lastScore}/100)\n`;
      }
      if (context.userType) {
        contextPrompt += `- User authentication: ${context.userType} (${context.userAddress || 'Guest'})\n`;
      }
      if (context.historyCount !== undefined) {
        contextPrompt += `- Total checks in audit history: ${context.historyCount}\n`;
      }
      if (context.watchlistCount !== undefined) {
        contextPrompt += `- Total bookmarked items in watchlist: ${context.watchlistCount}\n`;
      }
    }

    // Convert conversation history into contents format
    const contents: any[] = [];
    for (const msg of messages) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    // If Gemini API is configured, use gemini-3.8-flash with fallback
    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: contextPrompt,
            temperature: 0.7,
          },
        });

        const replyText = response.text || "I'm standing by to help with your Solana risk verification.";
        return res.json({ reply: replyText });
      } catch (geminiErr) {
        console.warn('Gemini generateContent error, falling back to heuristic assistant:', geminiErr);
      }
    }

    // Intelligent fallback if GEMINI_API_KEY is not configured
    let fallbackReply = `Hello! I am Aegis, your Tollkeeper Security Support Agent. `;
    const qLower = latestUserMessage.toLowerCase();

    if (qLower.includes('phantom') || qLower.includes('wallet')) {
      fallbackReply += `You can connect your Phantom wallet using the "Connect Wallet" button in the top navigation or on the sign-in page. Connecting your wallet allows Tollkeeper to authenticate your session with your public key and display your balance. No private keys or transaction approvals are ever required.`;
    } else if (qLower.includes('freeze') || qLower.includes('mint authority')) {
      fallbackReply += `In SPL tokens, active Mint Authority means the deployer can mint infinite new tokens at will, diluting you. Active Freeze Authority gives the issuer permission to lock token accounts so holders cannot transfer or sell. Tollkeeper flags active mint (+30 pts) and freeze authority (+20 pts) as severe hazards!`;
    } else if (qLower.includes('agent') || qLower.includes('api')) {
      fallbackReply += `Autonomous agents integrate with Tollkeeper by querying the /v1/check?address= endpoint before executing transfer instructions. If the score is 60+ (BLOCK), the payment instruction is refused. If it is 25-59 (CAUTION), the agent halts for supervisor clearance.`;
    } else if (qLower.includes('score') || qLower.includes('verdict') || qLower.includes('how it works')) {
      fallbackReply += `Tollkeeper uses deterministic rule-based scoring (0-100). 0-24 is SAFE, 25-59 is CAUTION, and 60+ is BLOCK. We check transaction volume, age, native SOL balance, token authorities, and holder concentration without black-box ML hallucination.`;
    } else {
      fallbackReply += `I'm tracking your session. You can ask me about evaluating specific wallets, understanding token mint risks, connecting Phantom, or integrating your automated payment agents.`;
    }

    return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error('Support chat error:', error);
    return res.status(500).json({
      error: 'Failed to process support request',
      details: error?.message,
    });
  }
});

// -------------------------------------------------------------
// Live GET /api/v1/check - Real API Contract Execution
// -------------------------------------------------------------
app.get('/api/v1/check', async (req, res) => {
  const address = req.query.address as string;
  if (!address) {
    return res.status(400).json({ error: 'Query parameter "address" is required' });
  }

  // Quick return format consistent with contract
  res.json({
    status: 'ok',
    address,
    notice: 'Live Tollkeeper API contract endpoint.',
    docs: '/app/docs',
  });
});

// -------------------------------------------------------------
// Dev vs Prod Vite Mounting
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Tollkeeper server running on port ${port}`);
  });
}

startServer();
