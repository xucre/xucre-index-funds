import { generateResponse } from "@/service/chat";
import { ChatCompletionMessageParam } from "openai/resources";

export async function POST(
  req: Request
) {
  const body = await req.json()
  if (!body.type) {
    return new Response('Invalid route or message type.', {
      status: 401,
    });    
  } else if (body.type === 'tokenResearcher') {
    const result = await generateResponse(JSON.parse(body.text) as ChatCompletionMessageParam[], 'tokenResearcher');
    const formattedResult = await generateResponse([{role: 'assistant', content: result}], 'markdownFormatter');
    return Response.json(formattedResult)
  } else if (body.type === 'historySummarizer') {
    const result = await generateResponse(JSON.parse(body.text) as ChatCompletionMessageParam[], 'historySummarizer');
    const formattedResult = await generateResponse([{role: 'assistant', content: result}], 'markdownFormatter');
    return Response.json(formattedResult)
  } else {
    return new Response('Invalid route or message type.', {
      status: 401,
    });
  }
  
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  maxDuration: 300,
}