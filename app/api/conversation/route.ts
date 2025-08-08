import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { currentUser } from '@clerk/nextjs/server';

// AssemblyAI API endpoint
const UPLOAD_URL = 'https://api.assemblyai.com/v2/upload';
const TRANSCRIPT_URL = 'https://api.assemblyai.com/v2/transcript';

export async function POST(request: Request) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data with the audio file
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('Received audio file:', audioFile.name, audioFile.type, audioFile.size);

    // Upload to Vercel Blob
    try {
      const blob = await put(`audio/${user.id}-${Date.now()}-${audioFile.name}`, audioFile, {
        access: 'public',
      });
      console.log('File uploaded to Vercel Blob:', blob.url);

      // Upload to AssemblyAI
      const uploadResponse = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: {
          'authorization': process.env.ASSEMBLYAI_API_KEY as string,
        },
        body: audioFile,
      });

      if (!uploadResponse.ok) {
        console.error('AssemblyAI upload failed:', await uploadResponse.text());
        return NextResponse.json(
          { error: 'Failed to upload to speech-to-text service' }, 
          { status: 500 }
        );
      }

      const uploadData = await uploadResponse.json();
      console.log('File uploaded to AssemblyAI:', uploadData.upload_url);

      // Request transcription
      const transcriptResponse = await fetch(TRANSCRIPT_URL, {
        method: 'POST',
        headers: {
          'authorization': process.env.ASSEMBLYAI_API_KEY as string,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: uploadData.upload_url,
          speaker_labels: true,
          speakers_expected: 2,
        }),
      });

      if (!transcriptResponse.ok) {
        console.error('AssemblyAI transcription request failed:', await transcriptResponse.text());
        return NextResponse.json(
          { error: 'Failed to request transcription' }, 
          { status: 500 }
        );
      }

      const transcriptData = await transcriptResponse.json();
      console.log('Transcription requested:', transcriptData.id);

      return NextResponse.json({
        success: true,
        transcript_id: transcriptData.id,
        status: transcriptData.status,
      });
    } catch (error: unknown) {
      console.error('Error in file processing:', error);
      return NextResponse.json(
        { error: 'Failed to process audio file' }, 
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error processing audio:', error);
    return NextResponse.json(
      { error: 'Failed to process audio file' }, 
      { status: 500 }
    );
  }
}