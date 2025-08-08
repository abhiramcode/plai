import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// AssemblyAI API endpoint
const TRANSCRIPT_URL = 'https://api.assemblyai.com/v2/transcript';

// Define proper types for utterances
interface Utterance {
  speaker: string;
  text: string;
  start: number;
  end: number;
}

interface TranscriptResponse {
  id: string;
  status: string;
  text: string;
  utterances?: Utterance[];
  error?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transcriptId = params.id;
    console.log(`Checking transcript status for ID: ${transcriptId}`);
    
    // Get transcript status from AssemblyAI
    const response = await fetch(`${TRANSCRIPT_URL}/${transcriptId}`, {
      method: 'GET',
      headers: {
        'authorization': process.env.ASSEMBLYAI_API_KEY as string,
        'content-type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to get transcription status' }, 
        { status: 500 }
      );
    }

    const data = await response.json() as TranscriptResponse;
    console.log('Transcript status:', data.status);

    // If completed, perform diarization processing
    if (data.status === 'completed') {
      // Update history with completed transcript
      console.log('Transcript completed, processing utterances');
        console.log('Utterances available:', !!data.utterances);
      await supabase
        .from('user_history')
        .update({
          output_content: JSON.stringify({
            transcript_id: data.id,
            status: data.status,
            text: data.text,
          }),
        })
        .match({
          user_id: user.id,
          skill_type: 'conversation',
        })
        .order('created_at', { ascending: false })
        .limit(1);

      // Process the utterances for diarization
      const diarizedText = processDiarization(data.utterances || []);

      return NextResponse.json({
        status: data.status,
        transcript: data.text,
        diarization: diarizedText,
      });
    }

    // Return current status if not completed
    return NextResponse.json({
      status: data.status,
    });
  } catch (error) {
    console.error('Error checking transcription status:', error);
    return NextResponse.json(
      { error: 'Failed to check transcription status' }, 
      { status: 500 }
    );
  }
}

// Function to process diarization data
function processDiarization(utterances: Utterance[]): string {
  if (!utterances || utterances.length === 0) {
    return '';
  }

  return utterances
    .map(utterance => `Speaker ${utterance.speaker}: ${utterance.text}`)
    .join('\n\n');
}