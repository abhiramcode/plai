// Types for utterances from AssemblyAI
interface Utterance {
  speaker: string;
  text: string;
  start: number;
  end: number;
}

// Process utterances into diarized text
export function processDiarization(utterances: Utterance[]): string {
  if (!utterances || utterances.length === 0) {
    return '';
  }

  // Map speaker IDs (like "A", "B") to speaker numbers (1, 2)
  const speakerMap = new Map<string, number>();
  let nextSpeakerNumber = 1;

  // Process each utterance
  return utterances
    .map(utterance => {
      // Assign speaker numbers consistently
      if (!speakerMap.has(utterance.speaker)) {
        speakerMap.set(utterance.speaker, nextSpeakerNumber++);
      }
      const speakerNumber = speakerMap.get(utterance.speaker);
      
      return `Speaker ${speakerNumber}: ${utterance.text}`;
    })
    .join('\n\n');
}

// Fallback diarization algorithm if needed
export function performDiarization(transcript: string): string {
  // This is a very simple algorithm that splits by sentence endings
  // and alternates speakers - only use as fallback
  const sentences = transcript.match(/[^.!?]+[.!?]+/g) || [];
  
  return sentences
    .map((sentence, index) => {
      const speakerNumber = (index % 2) + 1;
      return `Speaker ${speakerNumber}: ${sentence.trim()}`;
    })
    .join('\n\n');
}