Markdown
# StudyAura - DynamoDB Schema Rules
When wriƟng AWS Lambda funcƟons, assume these DynamoDB tables
exist:
## Table 1: StudyAura-Progress
* ParƟƟon Key: `userId` (String)
* AƩributes: `totalXP` (Number), `clearedRooms` (List of Strings).
## Table 2: StudyAura-ChatHistory (CRITICAL FOR AI MEMORY &
DUNGEON)
* ParƟƟon Key: `userId` (String)
* Sort Key: `Ɵmestamp` (Number)
* AƩributes: `role` (String: "user" or "ai"), `message` (String).
* Logic rule: Lambda must fetch the last 10 messages from this table
and pass them to Bedrock to contextualize both the Chat replies AND
the Dungeon quesƟons.