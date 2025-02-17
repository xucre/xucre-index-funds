'use client'
import axios from "axios";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const timeout = 300000;

export async function sendMessage (
  text: string,
) {
  const sendMessage = await axios({
    url: `/api/agent`,
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    data: JSON.stringify({ text, type: 'tokenResearcher' }),
    timeout      
  });

  return sendMessage.data;
}

export async function sendDatabaseMessage (
  text: string,
  agent: string
) {
  const sendMessage = await axios({
    url: `/api/agent`,
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    data: JSON.stringify({ text, type: 'database', agent: agent }),
    timeout      
  });

  return sendMessage.data;
}
