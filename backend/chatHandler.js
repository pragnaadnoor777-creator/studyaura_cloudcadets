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
 * Fetches the last 5 messages from StudyAura-ChatHistory for the given user.
 */
async function fetchChatHistory(userId) {
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: CHAT_HISTORY_TABLE,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": { S: userId } },
      ScanIndexForward: false, // descending — newest first
      Limit: 5,
    })
  );

  // Reverse to chronological order before passing to Bedrock
  return (result.Items || []).reverse().map((item) => ({
    role: item.role.S === "ai" ? "assistant" : "user",
    content: item.message.S,
  }));
}

/**
 * Saves the user prompt and AI reply to StudyAura-ChatHistory.
 */
async function saveChatHistory(userId, userMessage, aiReply) {
  const timestamp = Date.now();

  await Promise.all([
    dynamoClient.send(
      new PutItemCommand({
        TableName: CHAT_HISTORY_TABLE,
        Item: {
          userId: { S: userId },
          timestamp: { N: String(timestamp) },
          role: { S: "user" },
          message: { S: userMessage },
        },
      })
    ),
    dynamoClient.send(
      new PutItemCommand({
        TableName: CHAT_HISTORY_TABLE,
        Item: {
          userId: { S: userId },
          timestamp: { N: String(timestamp + 1) },
          role: { S: "ai" },
          message: { S: aiReply },
        },
      })
    ),
  ]);
}

/**
 * Sends chat history + new user prompt to Amazon Bedrock and returns the reply.
 */
async function invokeBedrockChat(history, newUserPrompt) {
  // Append the new user message to the history for the full conversation context
  const messages = [...history, { role: "user", content: newUserPrompt }];

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1024,
    system:
      "You are StudyAura's AI study assistant. Help the student with their questions, keep responses focused and encouraging.",
    messages,
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
  return rawBody.content?.[0]?.text || rawBody.completion || "";
}

/**
 * Lambda handler — entry point per the architecture spec:
 * API Gateway -> Lambda -> Bedrock -> DynamoDB
 */
export const handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { userId, message } = body || {};

    if (!userId || !message) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing required fields: userId and message" }),
      };
    }

    // 1. Fetch last 5 messages for context
    const history = await fetchChatHistory(userId);

    // 2. Send to Bedrock with history as context
    const aiReply = await invokeBedrockChat(history, message);

    // 3. Persist the new interaction to DynamoDB
    await saveChatHistory(userId, message, aiReply);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, reply: aiReply }),
    };
  } catch (err) {
    console.error("chatHandler error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error", details: err.message }),
    };
  }
};
