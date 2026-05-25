import { StateGraph, START, END } from '@langchain/langgraph';
import { StateAnnotation } from './state.js';
import { classifierNode, doctorNode, fileProcessorNode } from './nodes.js';

// ----------------------------------------------------
// ROUTING FUNCTION
// ----------------------------------------------------
function routeNext(state) {
  if (!state.isHealthTopic) {
    return END;
  }
  if (state.fileData) {
    return 'fileProcessor';
  }
  return 'doctorAgent';
}

// ----------------------------------------------------
// COMPILE THE LANGGRAPH
// ----------------------------------------------------
const workflow = new StateGraph(StateAnnotation);

workflow.addNode('classifier', classifierNode);
workflow.addNode('doctorAgent', doctorNode);
workflow.addNode('fileProcessor', fileProcessorNode);

// Use START to denote entry point in modern langgraph
workflow.addEdge(START, 'classifier');

// Add conditional edges
workflow.addConditionalEdges(
  'classifier',
  routeNext,
  {
    [END]: END,
    'fileProcessor': 'fileProcessor',
    'doctorAgent': 'doctorAgent'
  }
);

workflow.addEdge('doctorAgent', END);
workflow.addEdge('fileProcessor', END);

const chatbotAgent = workflow.compile();

export default chatbotAgent;
