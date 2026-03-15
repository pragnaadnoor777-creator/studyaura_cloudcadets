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

/**
 * Fetches the last 10 messages from StudyAura-ChatHistory for context.
 * Per spec: Lambda must pass chat history to Bedrock to contextualize responses.
 */
async function fetchChatHistory(userId) {
  const params = {
    TableName: CHAT_HISTORY_TABLE,
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: { ":uid": { S: userId } },
    ScanIndexForward: false, // descending by timestamp
    Limit: 10,
  };

  const result = await dynamoClient.send(new QueryCommand(params));
  const items = result.Items || [];

  // Reverse to chronological order for the prompt
  // Map "ai" -> "assistant" so Bedrock's Claude API accepts the role value
  return items.reverse().map((item) => ({
    role: item.role.S === "ai" ? "assistant" : "user",
    content: item.message.S,
  }));
}

/**
 * Saves the AI response to chat history for future context.
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
 * Calls Amazon Bedrock to analyze mental load and generate a study plan.
 */
async function invokeBedrockAnalysis(textPayload, chatHistory) {
  const historyContext =
    chatHistory.length > 0
      ? chatHistory
          .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
          .join("\n")
      : "No prior conversation history.";

  const systemPrompt = `You are StudyAura's AI engine. Your job is to analyze a student's "brain dump" text and:
1. Estimate their Mental Load as either HIGH or MODERATE (never any other value).
2. Generate a prioritized study plan based on what they've shared.

Always respond with valid JSON only — no markdown, no extra text.`;

  const userPrompt = `--- Prior Conversation Context ---
${historyContext}

--- Student Brain Dump ---
${textPayload}

Respond with this exact JSON structure:
{
  "mentalLoad": "HIGH" or "MODERATE",
  "mentalLoadReason": "brief explanation",
  "studyPlan": [
    {
      "priority": 1,
      "task": "task description",
      "estimatedTime": "e.g. 30 mins",
      "tip": "optional study tip"
    }
  ]
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

  // Claude returns content as an array of blocks
  const text = rawBody.content?.[0]?.text || rawBody.completion || "";
  return JSON.parse(text);
}

/**
 * Lambda handler — entry point per the architecture spec:
 * API Gateway -> Lambda -> Bedrock -> DynamoDB
 */
export const handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { userId, text } = body || {};

    if (!userId || !text) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing required fields: userId and text" }),
      };
    }

    // Fetch chat history for context (spec requirement)
    const chatHistory = await fetchChatHistory(userId);

    // Analyze with Bedrock
    const analysis = await invokeBedrockAnalysis(text, chatHistory);

    // Persist to chat history
    await saveChatHistory(userId, text, analysis);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error", details: err.message }),
    };
  }
};
