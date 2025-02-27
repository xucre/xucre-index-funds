import React, { useEffect, useRef, useState, FormEvent, KeyboardEvent } from 'react';
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { useLLMOutput } from '@llm-ui/react';
import { markdownLookBack } from '@llm-ui/markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from "../chat/chat.module.css";
import { Avatar, Box, Button, CircularProgress, Divider, Drawer, IconButton, Input, Skeleton, Stack, Typography } from '@mui/material';
import { Thread } from 'openai/resources/beta/threads/threads.mjs';
import {sendDatabaseMessage, sendMessage} from '@/service/api'
import Bubbles from './bubbles';
import Emoji from '../ui/Emoji';
import { AgentConfig } from '@/service/chat/types';
import {useChat} from '@ai-sdk/react';


// Simple Markdown component for rendering output blocks
const MarkdownComponent = ({ blockMatch }: { blockMatch: { output: string } }) => {
  const markdown = blockMatch.output;
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
    ul: ({ children }) => <ul style={{ paddingLeft: '1em' }}>{children}</ul>,
  }}>{markdown}</ReactMarkdown>;
};

const TextWithLineBreaks = ({text}: {text: string}) => {
    const textWithBreaks = text.split('\n').map((text, index) => (
        <Box key={index} p={0.2}>
            <MarkdownComponent key={index} blockMatch={{ output: text }} />
        </Box>
    ));
  
    return <div>{textWithBreaks}</div>;
}

const ChatInterface = ({agent} :{agent?: AgentConfig}) => {
    const [currentThread, setCurrentThread] = useState("");
    const [loading, setLoading] = useState(false);

    const [threadList, setThreadList] = useState([] as Thread[]);
    const messageListRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    // Use an array to store message history
    //const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([{role: 'assistant', content: 'Hello! How can I help you today?'}]);
    //const [input, setInput] = useState('');
    const { handleSubmit: sendInput, setInput, input, messages } = useChat({
        api: '/api/chat-agent',
        maxSteps: 8,
        experimental_prepareRequestBody: (input) => {
            const trimmedHistory = input.messages.length <= 5 ? input.messages : input.messages.slice(-5);
            const parsedHistory = trimmedHistory.map((message) => {
                return {
                    role: message.role,
                    content: message.content
                } as ChatCompletionMessageParam;
            });
            const payload = { text: JSON.stringify(parsedHistory), type: 'database', agent: JSON.stringify(agent) };
            return JSON.stringify(payload);
        },
    });
    const handleSendMessage = async () => {
        if (!input.trim()) return;
        setInput('');
        sendInput();
        // const newUserMessage: ChatCompletionMessageParam = { role: 'user', content: input };
        // const newMessages = [...messages, newUserMessage];
        // setMessages(newMessages);
        

        // Trim history to last 5 messages
        // const trimmedHistory = newMessages.length <= 5 ? newMessages : newMessages.slice(-5);

        // try {
        //     console.log('calling sendDataBaseMessage');
        //     const result = await sendDatabaseMessage(JSON.stringify(trimmedHistory), JSON.stringify(agent));
        //     console.log(result);
        //     //const respText = typeof response === 'string' ? response : JSON.stringify(response);
        //     //const newAssistantMessage: ChatCompletionMessageParam = { role: 'assistant', content: respText };
        //     // setMessages((prevMessages) => [...prevMessages, {
        //     //     role: 'assistant',
        //     //     content: result.response
        //     // } as ChatCompletionMessageParam]);
        //     //setMessages([...newMessages, ...response as ChatCompletionMessageParam[]]);
        // } catch (error) {
        //     console.log(error);
        //     const errorMessage: ChatCompletionMessageParam = { role: 'assistant', content: 'Error processing message.' };
        //     setMessages([...newMessages, errorMessage]);
        // }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
    
        if (input.trim() === "") {
          return;
        }
        setLoading(true);
        try {
            await handleSendMessage();
            setLoading(false);
        } catch (err) {
          console.log(err);
          return;
        }
    
    };
    
    // Prevent blank submissions and allow for multiline input
    const handleEnter = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && input) {
        if (!e.shiftKey && input) {
        handleSubmit(e);
        }
    } else if (e.key === "Enter") {
        e.preventDefault();
    }
    };

    // Construct a transcript string from messages for useLLMOutput
    // const chatTranscript = messages.map(msg => msg.role === 'user' ? `User: ${msg.content}` : `Assistant: ${msg.content}`).join('\n');

    // const { blockMatches } = useLLMOutput({
    //     llmOutput: chatTranscript,
    //     fallbackBlock: {
    //         component: MarkdownComponent,
    //         lookBack: markdownLookBack(),
    //     },
    //     blocks: [],
    //     isStreamFinished: true,
    // });

    useEffect(() => {
        if (messageListRef.current) {
          const messageList = messageListRef.current;
          messageList.scrollTop = messageList.scrollHeight;
        }
    }, [messages]);
    
    return (
        <div className={styles.main}>
            <div className={styles.cloud}>
                <div ref={messageListRef} className={styles.messagelist}>
                {messages.filter((message) => typeof message.content === 'string').map((message, index) => {
                    return (
                        <div key={index} className={`${styles.messageContainer} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
                            <div className={styles.messageContent} style={{whiteSpace: 'pre'}}>{typeof message.content === 'string' ? <TextWithLineBreaks text={decodeURI(message.content.replaceAll('"',''))} /> : ''}</div>
                            {/* <div className={styles.messageRole}>{message.role === 'user' ? 'You' : 'Assistant'}</div> */}
                        </div>
                    );
                })}
                {loading && 
                    <Box sx={{textAlign: 'center'}} mx={'auto'} className={styles.bubblesContainer}>
                        <Typography paddingX={10} sx={{verticalAlign: 'middle'}}>Baking the <Emoji symbol={'26'}  className='' label={'Cooking'}/></Typography><Bubbles />
                    </Box>
                }
                </div>
            </div>
            <div className={styles.center}>
                <div className={styles.cloudform}>
                <form onSubmit={handleSubmit}>
                    <textarea
                    disabled={loading}
                    onKeyDown={handleEnter}
                    ref={textAreaRef}
                    autoFocus={false}
                    rows={1}
                    maxLength={512}

                    id="userInput"
                    name="userInput"
                    placeholder={
                        loading ? "Waiting for response..." : "Type your question..."
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className={styles.textarea}
                    />
                    <button
                    type="submit"
                    disabled={loading}
                    className={styles.generatebutton}
                    >
                    {loading ? (
                        <div className={styles.loadingwheel}>
                        <CircularProgress color="inherit" size={20} />{" "}
                        </div>
                    ) : (
                        // Send icon SVG in input field
                        <svg
                        viewBox="0 0 20 20"
                        className={styles.svgicon}
                        xmlns="http://www.w3.org/2000/svg"
                        >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                        </svg>
                    )}
                    </button>
                </form>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
