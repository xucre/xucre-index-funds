// filepath: /Users/jp/Desktop/Repos/xucre/xucre-index-funds/service/chat/tools/caseCreate.ts
import { currentUser } from '@clerk/nextjs/server';
import { createCase } from '../../sfdc';
import { createTool } from '@covalenthq/ai-agent-sdk';
import { tool } from 'ai';
import { z } from 'zod';

const execute = async (params: { subject: string; description: string; }) => {
  const { subject, description } = params;
  const user = await currentUser()
  try {
    if (!user?.emailAddresses[0]?.emailAddress) {
        return JSON.stringify({ success: false, message: 'User email not found' });
    }
    const result = await createCase(subject, description, user?.emailAddresses[0].emailAddress.toString());
    if (!result || result.success === false) {
        return JSON.stringify({ success: false, message: 'Error creating case.' });
    }
    return JSON.stringify({ success: true, message: 'Case created successfully: '+ result?.id});    
  } catch (error) {
    return JSON.stringify({ success: false, message: 'Error creating case.' });
  }
  
};

const schema = z.object({
  subject: z.string().describe('The subject of the case.'),
  description: z.string().describe('The description of the case.'),
  contactEmail: z.string().email().describe('The email to contact about the case.'),
});

export const caseCreateTool = createTool({
  id: 'create-case-tool',
  description: 'Tool to create a support case using Salesforce createCase function.',
  schema,
  execute,
});

export const ai_caseCreateTool = tool({
  description: 'Tool to create a support case using Salesforce createCase function.',
  parameters: schema,
  execute,
});
