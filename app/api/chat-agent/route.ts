'use server'
import { generateDatabaseResponse, generateResponse, generateWorkflowResponse } from "@/service/chat";
import { listAgentConfigs } from "@/service/chat/db";
import { AgentConfig } from "@/service/chat/types";
import { ChatCompletionMessageParam } from "openai/resources";
import { NextResponse } from 'next/server';
import { testResponse } from "@/service/chat/config";

export async function GET() {
  console.log('api/chat-agent GET');
  const configs = await listAgentConfigs();
  return NextResponse.json(configs);
}
export async function POST(
  req: Request
) {
  const body = await req.json()
  // console.log('api/chat-agent POST', body);
  if (!body.type || !body.text) {
    return new NextResponse('Invalid route or message type.', {
      status: 401,
    });    
  } else if (body.type === 'database') {
    const chatParams = JSON.parse(body.text) as ChatCompletionMessageParam[];
    const agentConfig = JSON.parse(body.agent) as AgentConfig;
    //console.log(chatParams, agentConfig);
    const result = await generateWorkflowResponse(chatParams, agentConfig);
    if (result === "Error") return new NextResponse('Failed to generate response.');
    //const formattedResult = await generateResponse(result.messages, 'markdownFormatter');
    return NextResponse.json(result.messages)
  } else if (body.type === 'tokenResearcher') {
    const result = await generateResponse(JSON.parse(body.text) as ChatCompletionMessageParam[], 'tokenResearcher');
    const formattedResult = await generateResponse([{role: 'assistant', content: result}], 'markdownFormatter');
    return NextResponse.json(formattedResult)
  } else if (body.type === 'historySummarizer') {
    const result = await generateResponse(JSON.parse(body.text) as ChatCompletionMessageParam[], 'historySummarizer');
    const formattedResult = await generateResponse([{role: 'assistant', content: result}], 'markdownFormatter');
    return NextResponse.json(formattedResult)
  } else {
    return new NextResponse('Invalid route or message type.', {
      status: 401,
    });
  }
  // const configs = await listAgentConfigs();
  // return NextResponse.json(configs);
}


// export async function POST(
//   req: Request
// ) {
//   console.log('api/chat-agent POST');
//   const body = await req.json()
//   console.log(body);
//   if (!body.type) {
//     return new NextResponse('Invalid route or message type.', {
//       status: 401,
//     });    
//   } else if (body.type === 'database') {
//     const result = await generateDatabaseResponse(JSON.parse(body.text) as ChatCompletionMessageParam[], JSON.parse(body.agent) as AgentConfig);
//     const formattedResult = await generateResponse([{role: 'assistant', content: result}], 'markdownFormatter');
//     return NextResponse.json(formattedResult)
//   } else if (body.type === 'tokenResearcher') {
//     const result = await generateResponse(JSON.parse(body.text) as ChatCompletionMessageParam[], 'tokenResearcher');
//     const formattedResult = await generateResponse([{role: 'assistant', content: result}], 'markdownFormatter');
//     return NextResponse.json(formattedResult)
//   } else if (body.type === 'historySummarizer') {
//     const result = await generateResponse(JSON.parse(body.text) as ChatCompletionMessageParam[], 'historySummarizer');
//     const formattedResult = await generateResponse([{role: 'assistant', content: result}], 'markdownFormatter');
//     return NextResponse.json(formattedResult)
//   } else {
//     return new NextResponse('Invalid route or message type.', {
//       status: 401,
//     });
//   }
  
// }


//export const maxDuration = 300;