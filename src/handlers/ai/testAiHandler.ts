import { Context } from 'hono';
import OpenAi from 'openai';
import {AiAction, aiTools } from '../../models/AiModels';
import { buildFortifierPrompt, buildSystemPrompt, parseAiActions } from '../../util/aiUtil';

type TestAiBody = {
  promt: string,
  width: number,
  height: number,
}

const AI_MODEL = "gpt-5-mini"

type TestAiResponse = {
  actions: AiAction[]
  planText: string
}

export const testAiHandler = async (c: Context) => {
  try{

    return c.json("message, not implemented", 404)

    const body = await c.req.json<TestAiBody>();

    const openai = new OpenAi({apiKey: c.env.OPENAI_API_KEY})


    /*const fortifierSystemPromt: string = buildFortifierPrompt(body.width, body.height);
    
    const fortifyPromtResponse = await openai.responses.create({
      model: AI_MODEL,
      input: [
        {
          role: 'system',
          content: fortifierSystemPromt
        },
        {
          role: 'user',
          content: body.promt,
        }
      ]
    })*/



    //const planText = fortifyPromtResponse.output_text;

    const systemPrompt = buildSystemPrompt(body.width, body.height, "");

    const aiResponse = await openai.responses.create({
      model: AI_MODEL,

      input: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: body.promt
        }
      ],

      tools: aiTools,
      tool_choice: "required",
      max_output_tokens: 1200
    });

    const response: TestAiResponse = {actions : parseAiActions(aiResponse), planText: "hej"};

    return c.json(response, 200)
  }
  catch(error) {
    console.error("Error testing ai:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
}