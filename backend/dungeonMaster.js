import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import {
  DynamoDBClient,
  QueryCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });

const CHAT_HISTORY_TABLE = "StudyAura-ChatHistory";
const PROGRESS_TABLE = "StudyAura-Progress";
const MODEL_ID = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-sonnet-20240229-v1:0";

/**
 * Fetches the last 10 messages from StudyAura-ChatHistory.
 * Per spec: Lambda must pass chat history to Bedrock to contextualize Dungeon questions.
 */
async function fetchChatHistory(userId) {
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: CHAT_HISTORY_TABLE,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": { S: userId } },
      ScanIndexForward: false,
      Limit: 10,
    })
  );

  return (result.Items || []).reverse().map((item) => ({
    role: item.role.S === "ai" ? "assistant" : "user",
    content: item.message.S,
  }));
}

/**
 * Calls Bedrock to generate a Knowledge Dungeon challenge based on chat history.
 * Returns: { roomName, question, correctAnswer, explanation }
 */
async function generateDungeonChallenge(chatHistory) {
  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1024,
    system:
      "You are StudyAura's Dungeon Master AI. Based on the student's recent study conversation, generate a Knowledge Dungeon challenge. Always respond with valid JSON only — no markdown, no extra text.",
    messages: [
      ...chatHistory,
      {
        role: "user",
        content: `Generate a Knowledge Dungeon challenge (Room Name and Question) based specifically on the topic the user was just discussing.

Respond with this exact JSON structure:
{
  "roomName": "creative dungeon room name related to the topic",
  "question": "a clear, specific question about the topic",
  "correctAnswer": "the correct answer",
  "explanation": "brief explanation of why this is correct"
}`,
      },
    ],
  });

  const response = await bedrockClient.send(
    new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body,
    })
  );

  const rawBody = JSON.parse(new TextDecoder().decode(response.body));
  const text = rawBody.content?.[0]?.text || rawBody.completion || "";
  return JSON.parse(text);
}

/**
 * Verifies the user's answer against the correct answer using Bedrock for semantic matching.
 * Returns true if the answer is correct (allows for paraphrasing).
 */
async function verifyAnswer(question, correctAnswer, userAnswer) {
  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 128,
    system:
      "You are an answer verification engine. Respond with valid JSON only — no markdown, no extra text.",
    messages: [
      {
        role: "user",
        content: `Question: "${question}"
Correct Answer: "${correctAnswer}"
Student's Answer: "${userAnswer}"

Is the student's answer correct or essentially equivalent to the correct answer? Allow for paraphrasing and minor wording differences.

Respond with this exact JSON:
{ "isCorrect": true or false, "feedback": "brief encouraging feedback" }`,
      },
    ],
  });

  const response = await bedrockClient.send(
    new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body,
    })
  );

  const rawBody = JSON.parse(new TextDecoder().decode(response.body));
  const text = rawBody.content?.[0]?.text || rawBody.completion || "";
  return JSON.parse(text);
}

/**
 * Adds +20 XP to the user's totalXP in StudyAura-Progress.
 */
async function addXP(userId, xpAmount = 20) {
  await dynamoClient.send(
    new UpdateItemCommand({
      TableName: PROGRESS_TABLE,
      Key: { userId: { S: userId } },
      UpdateExpression: "ADD totalXP :xp",
      ExpressionAttributeValues: { ":xp": { N: String(xpAmount) } },
    })
  );
}

/**
 * Lambda handler — supports two actions:
 *
 * action: "generate" — generates a new dungeon challenge based on chat history
 *   Request:  { userId, action: "generate" }
 *   Response: { roomName, question, correctAnswer, explanation }
 *
 * action: "verify" — verifies a user's answer and awards XP if correct
 *   Request:  { userId, action: "verify", question, correctAnswer, userAnswer }
 *   Response: { isCorrect, feedback, xpAwarded }
 */
export const handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { userId, action } = body || {};

    if (!userId || !action) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing required fields: userId and action" }),
      };
    }

    // --- GENERATE a new dungeon challenge ---
    if (action === "generate") {
      const chatHistory = await fetchChatHistory(userId);

      if (chatHistory.length === 0) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            error: "No chat history found. Start a study session before entering the dungeon.",
          }),
        };
      }

      const challenge = await generateDungeonChallenge(chatHistory);

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          roomName: challenge.roomName,
          question: challenge.question,
          correctAnswer: challenge.correctAnswer,
          explanation: challenge.explanation,
        }),
      };
    }

    // --- VERIFY a user's answer ---
    if (action === "verify") {
      const { question, correctAnswer, userAnswer } = body;

      if (!question || !correctAnswer || !userAnswer) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            error: "Missing required fields for verify: question, correctAnswer, userAnswer",
          }),
        };
      }

      const result = await verifyAnswer(question, correctAnswer, userAnswer);

      let xpAwarded = 0;
      if (result.isCorrect) {
        await addXP(userId, 20);
        xpAwarded = 20;
      }

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          isCorrect: result.isCorrect,
          feedback: result.feedback,
          xpAwarded,
        }),
      };
    }

    // Unknown action
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: `Unknown action: "${action}". Use "generate" or "verify".` }),
    };
  } catch (err) {
    console.error("dungeonMaster error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error", details: err.message }),
    };
  }
};
