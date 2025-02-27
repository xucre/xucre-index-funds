'use client'
import axios from "axios";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const timeout = 300000;

export async function sendMessage (
  text: string,
) {
  const sendMessage = await axios({
    url: `/api/chat`,
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
  const payload = { text, type: 'database', agent };
  const sendMessage = await fetch(`/api/chat-agent`,{
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(payload)      
  });

  if (!sendMessage.ok) {
    throw new Error('Network response was not ok');
  }
  const reader = sendMessage.body?.getReader();
  if (!reader) {
    throw new Error('Failed to get reader');
  }
  return reader;
}
