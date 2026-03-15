Markdown
# StudyAura - AWS Architecture & Backend Rules
## 1. Cloud Engine Flow
Whenever generaƟng backend code, adhere strictly to this data flow:
User Interface -> API Gateway -> AWS Lambda -> Amazon Bedrock ->
DynamoDB -> S3.
## 2. Service ResponsibiliƟes
* **Amazon Bedrock:** Generate the AI Chat responses, analyze the
BrainDump for Mental Load, and generate LearnQuest Dungeon
quesƟons.
* **AWS Lambda:** Handles all rouƟng, API processing, and database fetching.
Markdown
# StudyAura - AWS Architecture & Backend Rules
## 1. Cloud Engine Flow
Whenever generaƟng backend code, adhere strictly to this data flow:
User Interface -> API Gateway -> AWS Lambda -> Amazon Bedrock ->
DynamoDB -> S3.
## 2. Service ResponsibiliƟes
* **Amazon Bedrock:** Generate the AI Chat responses, analyze the
BrainDump for Mental Load, and generate LearnQuest Dungeon
quesƟons.
* **AWS Lambda:** Handles all rouƟng, API processing, and databas