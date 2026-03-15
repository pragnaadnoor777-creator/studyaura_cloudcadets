import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });

const CHAT_HISTORY_TABLE = "StudyAura-ChatHistory";
const MODEL_ID = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-sonnet-20240229-v1:0";

// --- FIX: Defined the missing CORS_HEADERS variable ---
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Fetches the last 10 messages from StudyAura-ChatHistory for context.
 */
async function fetchChatHistory(userId) {
  const params = {
    TableName: CHAT_HISTORY_TABLE,
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: { ":uid": { S: userId } },
    ScanIndexForward: false, 
    Limit: 10,
  };

  const result = await dynamoClient.send(new QueryCommand(params));
  const items = result.Items || [];

  return items.reverse().map((item) => ({
    role: item.role.S,
    content: item.message.S,
  }));
}

/**
 * Saves the AI response to chat history.
 */
async function saveChatHistory(userId, userMessage, aiResponse) {
  const timestamp = Date.now();

  const putUser = new PutItemCommand({
    TableName: CHAT_HISTORY_TABLE,
    Item: {
      userId: { S: userId },
      timestamp: { N: String(timestamp) },
      role: { S: "user" },
      message: { S: userMessage },
    },
  });

  const putAi = new PutItemCommand({
    TableName: CHAT_HISTORY_TABLE,
    Item: {
      userId: { S: userId },
      timestamp: { N: String(timestamp + 1) },
      role: { S: "ai" },
      message: { S: JSON.stringify(aiResponse) },
    },
  });

  await Promise.all([
    dynamoClient.send(putUser),
    dynamoClient.send(putAi),
  ]);
}

/**
 * Calls Amazon Bedrock to analyze mental load.
 */
async function invokeBedrockAnalysis(textPayload, chatHistory) {
  const historyContext =
    chatHistory.length > 0
      ? chatHistory
          .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
          .join("\n")
      : "No prior conversation history.";

  const systemPrompt = `You are StudyAura's AI engine. Respond with valid JSON only.`;

  const userPrompt = `Context: ${historyContext}\n\nInput: ${textPayload}\n\nRespond with:
{
  "mentalLoad": "HIGH" or "MODERATE",
  "mentalLoadReason": "string",
  "studyPlan": [{ "priority": number, "task": "string", "estimatedTime": "string" }]
}`;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  const response = await bedrockClient.send(command);
  const rawBody = JSON.parse(new TextDecoder().decode(response.body));
  let text = rawBody.content?.[0]?.text || rawBody.completion || "";
  
  // --- DEBUG: Clean markdown formatting if AI includes it ---
  text = text.replace(/```json|```/g, "").trim();
  
  return JSON.parse(text);
}

/**
 * Lambda handler
 */
export const handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { userId, text } = body || {};

    if (!userId || !text) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Missing userId and text" }),
      };
    }

    const chatHistory = await fetchChatHistory(userId);
    const analysis = await invokeBedrockAnalysis(text, chatHistory);
    await saveChatHistory(userId, text, analysis);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        userId,
        mentalLoad: analysis.mentalLoad,
        mentalLoadReason: analysis.mentalLoadReason,
        studyPlan: analysis.studyPlan,
      }),
    };
  } catch (err) {
    console.error("analyzeChaos error:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Internal server error", details: err.message }),
    };
  }
};