
import { Agent, ZeeWorkflow } from "@covalenthq/ai-agent-sdk";
//import fundAgent from "../agents/fundBuilder";


export default (agent: Agent, description: string, output: string) => { 
  return new ZeeWorkflow({
    description: description,
    output: output,
    agents: { agent },
    maxIterations: 10,
  });
}