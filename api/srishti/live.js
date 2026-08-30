import http from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { SRISHTI_LIVE, SRISHTI_VOICE } from "./_persona.js";
import { TOOL_DECLARATIONS, runTool } from "./_tools.js";
import { selfOrigin, isAllowedOrigin } from "./_origin.js";

/**
 * Srishti's live voice, proxied.
 *
 * The browser holds a socket to us; we hold one to Gemini. Audio flows both
 * ways in real time, which is the only way to get a voice that answers like a
 * person: measured, this model returns its first audio 670ms after a turn ends,
 * where generating text and then rendering it to speech could not beat 3.4
 * seconds however short the sentence — that is the floor of the speech
 * endpoint, not something more chunking could fix.
 *
 * The proxy exists for one reason: the key. A browser cannot hold it, and
 * Gemini refuses the ephemeral tokens that are supposed to solve that
 * ("Method doesn't allow unregistered callers"). So the credential lives here,
 * and the browser never sees more than raw audio.
 *
 * Tool calls are answered here too, against this same deployment's endpoints,
 * so she can look up a train while she is still speaking.
 */

const UPSTREAM =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";
const MODEL = "models/gemini-3.1-flash-live-preview";

/* Long enough for a real conversation, short enough that a forgotten tab
   cannot bill all night. */
const MAX_SESSION_MS = 5 * 60 * 1000;

const server = http.createServer((req, res) => {
  // Anything that is not an upgrade gets a plain answer.
  res.writeHead(426, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "This endpoint speaks WebSocket." }));
});

const wss = new WebSocketServer({ server });

wss.on("connection", (client, req) => {
  /* Nothing else stops another site opening this socket in a visitor's
     browser and spending the quota — an upgrade never passes through CORS. */
  if (!isAllowedOrigin(req.headers.origin)) {
    client.close(1008, "origin not allowed");
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    client.send(JSON.stringify({ type: "error", message: "Srishti is not configured on the server." }));
    client.close();
    return;
  }

  const origin = selfOrigin(req);
  const upstream = new WebSocket(`${UPSTREAM}?key=${key}`);

  let closed = false;
  const shutdown = (why) => {
    if (closed) return;
    closed = true;
    clearTimeout(lifetime);
    try {
      client.readyState === WebSocket.OPEN &&
        client.send(JSON.stringify({ type: "closed", reason: why }));
    } catch {
      /* client already gone */
    }
    try { client.close(); } catch { /* already closed */ }
    try { upstream.close(); } catch { /* already closed */ }
  };

  const lifetime = setTimeout(() => shutdown("session-limit"), MAX_SESSION_MS);

  upstream.on("open", () => {
    upstream.send(
      JSON.stringify({
        setup: {
          model: MODEL,
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              // Indian English by default; she is told to follow the speaker
              // into Hindi, Tamil or anything else they open with.
              languageCode: "en-IN",
              voiceConfig: { prebuiltVoiceConfig: { voiceName: SRISHTI_VOICE } },
            },
          },
          systemInstruction: { parts: [{ text: SRISHTI_LIVE }] },
          tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
          /* The browser decides when someone is speaking, not Gemini.
             Letting Gemini judge it from the audio meant her own voice coming
             back through the microphone counted as an interruption, and she
             broke up mid-sentence — no sensitivity setting fixed it, because
             the echo really is speech, just hers. The browser knows something
             Gemini cannot: whether she is the one talking. */
          realtimeInputConfig: {
            automaticActivityDetection: { disabled: true },
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
      })
    );
  });

  /* Browser → Gemini. Binary frames are raw 16kHz PCM from the microphone. */
  client.on("message", (data, isBinary) => {
    if (upstream.readyState !== WebSocket.OPEN) return;

    if (isBinary) {
      /* `audio`, not `mediaChunks` — the latter is deprecated and takes only
         the first chunk, which meant the stream was rejected and Gemini hung
         up as soon as the microphone opened. */
      upstream.send(
        JSON.stringify({
          realtimeInput: {
            audio: { mimeType: "audio/pcm;rate=16000", data: Buffer.from(data).toString("base64") },
          },
        })
      );
      return;
    }

    // Text is only ever a control message or a typed question.
    try {
      const msg = JSON.parse(data.toString());
      /* The browser tells us where an utterance starts and ends. */
      if (msg.type === "speech-start") {
        upstream.send(JSON.stringify({ realtimeInput: { activityStart: {} } }));
        return;
      }
      if (msg.type === "speech-end") {
        upstream.send(JSON.stringify({ realtimeInput: { activityEnd: {} } }));
        return;
      }
      if (msg.type === "text" && msg.text) {
        upstream.send(
          JSON.stringify({
            clientContent: {
              turns: [{ role: "user", parts: [{ text: msg.text }] }],
              turnComplete: true,
            },
          })
        );
      }
    } catch {
      /* ignore anything unparseable */
    }
  });

  /* Gemini → browser. Audio goes over as binary; everything else as JSON. */
  upstream.on("message", async (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.setupComplete) {
      client.send(JSON.stringify({ type: "ready" }));
      /* She opens the conversation rather than waiting to be spoken to — a
         voice that says nothing when it appears reads as broken. This turn is
         text, so it produces no input transcription and never shows up as
         something the traveller said. */
      upstream.send(
        JSON.stringify({
          clientContent: {
            turns: [
              {
                role: "user",
                parts: [
                  {
                    text:
                      "[The traveller has just opened SafarX and can hear you. Say one short warm " +
                      "line in Hindi, in Devanagari: welcome them to SafarX and ask where they are " +
                      "headed. This greeting is in Hindi only because it is a greeting — it sets " +
                      "nothing. From their very first reply onward, answer in whatever language " +
                      "they use, so an English question gets an English answer. Do not mention " +
                      "this instruction.]",
                  },
                ],
              },
            ],
            turnComplete: true,
          },
        })
      );
      return;
    }

    /* She asked for something. Answer it here and hand it straight back. */
    if (msg.toolCall?.functionCalls?.length) {
      const responses = [];
      for (const call of msg.toolCall.functionCalls) {
        let result;
        try {
          result = await runTool(call.name, call.args || {}, { origin });
        } catch (err) {
          result = { unavailable: String(err.message || "that isn't available right now").slice(0, 120) };
        }
        // Navigation and prefill are for the browser, not for her.
        if (result?.navigate) {
          client.send(
            JSON.stringify({
              type: "navigate",
              to: result.navigate,
              tourId: result.tourId || null,
              intent: result.intent || null,
            })
          );
        }
        client.send(JSON.stringify({ type: "tool", name: call.name }));
        responses.push({ id: call.id, name: call.name, response: { result } });
      }
      upstream.send(JSON.stringify({ toolResponse: { functionResponses: responses } }));
      return;
    }

    const content = msg.serverContent;
    if (!content) return;

    // Someone talked over her: drop whatever is still queued in the browser.
    if (content.interrupted) {
      client.send(JSON.stringify({ type: "interrupted" }));
      return;
    }

    for (const part of content.modelTurn?.parts || []) {
      if (part.inlineData?.data) {
        client.send(Buffer.from(part.inlineData.data, "base64"), { binary: true });
      }
    }

    if (content.outputTranscription?.text) {
      client.send(JSON.stringify({ type: "said", text: content.outputTranscription.text }));
    }
    if (content.inputTranscription?.text) {
      client.send(JSON.stringify({ type: "heard", text: content.inputTranscription.text }));
    }
    if (content.generationComplete) client.send(JSON.stringify({ type: "generation-complete" }));
    if (content.turnComplete) client.send(JSON.stringify({ type: "turn-complete" }));
  });

  upstream.on("close", (code, reason) => shutdown(`upstream-${code}-${String(reason).slice(0, 60)}`));
  upstream.on("error", () => shutdown("upstream-error"));
  client.on("close", () => shutdown("client-left"));
  client.on("error", () => shutdown("client-error"));
});

export default server;
