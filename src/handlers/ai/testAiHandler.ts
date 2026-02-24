import { Context } from 'hono';
import OpenAi from 'openai';
import { buildFortifierPrompt, buildSystemPrompt, extractSummaryFromPlan, makePromts, parseJsonActions, ToolCall } from '../../util/aiUtil';

export type MessageItem = {
  message:string,
  fromUser: boolean,
}

type TestAiBody = {
  promts?: MessageItem[],
  promt?: string,
  width: number,
  height: number,
}

const AI_MODEL = "gpt-5.2"

type TestAiResponse = {
  actions: ToolCall[]
  intent: 'DRAW' | 'CHAT' | 'CLARIFY'
  shouldCallTools: boolean
  message: string
}

export const testAiHandler = async (c: Context) => {
  try{
    const body = await c.req.json<TestAiBody>();

    const messages: MessageItem[] = Array.isArray(body.promts)
      ? body.promts
      : body.promt != null
        ? [{ message: String(body.promt), fromUser: true }]
        : [];

    const openai = new OpenAi({apiKey: c.env.OPENAI_API_KEY})

    const fortifierSystemPromt: string = buildFortifierPrompt(body.width, body.height);
    
    const fortifyPromtResponse = await openai.responses.create({
      model: AI_MODEL,
      input: [
        {
          role: 'system',
          content: fortifierSystemPromt
        },
        {
          role: 'user',
          content: makePromts(messages),
        }
      ]
    })

    const planText = fortifyPromtResponse.output_text;
    const summaryMessage = extractSummaryFromPlan(planText);

    const systemPrompt = buildSystemPrompt(body.width, body.height, planText);

    const aiResponse = await openai.responses.create({
      model: AI_MODEL,
      input: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: "Output the JSON array now."
        }
      ],
    });

    const actions = parseJsonActions(aiResponse.output_text);

    const response: TestAiResponse = {
      actions,
      intent: 'DRAW',
      shouldCallTools: actions.length > 0,
      message: summaryMessage,
    };

    return c.json(response, 200)
  }
  catch(error) {
    console.error("Error testing ai:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
}