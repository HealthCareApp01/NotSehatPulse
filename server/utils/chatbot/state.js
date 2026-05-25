import { Annotation } from '@langchain/langgraph';

export const StateAnnotation = Annotation.Root({
  messages: Annotation({
    reducer: (x, y) => (x || []).concat(y || []),
    default: () => []
  }),
  fileData: Annotation({
    reducer: (x, y) => y !== undefined ? y : x,
    default: () => null
  }),
  extractedMedicines: Annotation({
    reducer: (x, y) => y !== undefined ? y : x,
    default: () => []
  }),
  summary: Annotation({
    reducer: (x, y) => y !== undefined ? y : x,
    default: () => ""
  }),
  isHealthTopic: Annotation({
    reducer: (x, y) => y !== undefined ? y : x,
    default: () => true
  }),
  retryFeedback: Annotation({
    reducer: (x, y) => y !== undefined ? y : x,
    default: () => ""
  }),
  onToken: Annotation({
    reducer: (x, y) => y !== undefined ? y : x,
    default: () => null
  })
});
