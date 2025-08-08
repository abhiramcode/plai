import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// AssemblyAI API endpoint
const TRANSCRIPT_URL = 'https://api.assemblyai.com/v2/transcript';

interface Utterance {
  speaker: string;
  text: string;
  start: number;
  end: number;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: transcriptId } = await params;

    const response = await fetch(`${TRANSCRIPT_URL}/${transcriptId}`, {
      method: 'GET',
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY as string,
        'content-type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to get transcription status' },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (data.status === 'completed') {
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

      const diarizedText = processDiarization(data.utterances || []);
      return NextResponse.json({
        status: data.status,
        transcript: data.text,
        diarization: diarizedText,
      });
    }

    return NextResponse.json({ status: data.status });
  } catch (error: unknown) {
    console.error('Error checking transcription status:', error);
    return NextResponse.json(
      { error: 'Failed to check transcription status' },
      { status: 500 }
    );
  }
}

function processDiarization(utterances: Utterance[]): string {
  if (!utterances?.length) return '';
  return utterances
    .map(u => `Speaker ${u.speaker}: ${u.text}`)
    .join('\n\n');
}
