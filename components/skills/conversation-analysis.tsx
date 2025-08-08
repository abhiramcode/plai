"use client";

import { useState, useEffect, useRef } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResultCard } from '@/components/ui/result-card';
import { Loading } from '@/components/ui/loading';

export function ConversationAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [transcriptId, setTranscriptId] = useState<string | null>(null);
  const [pollingCount, setPollingCount] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [result, setResult] = useState<{
    transcript: string;
    diarization: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Effect to handle polling
  useEffect(() => {
    if (transcriptId && !pollingIntervalRef.current) {
      console.log('Starting polling for transcript:', transcriptId);
      pollingIntervalRef.current = setInterval(checkTranscriptionStatus, 3000);
    }
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [transcriptId]);

  const handleFileSelect = async (file: File) => {
    try {
      setIsLoading(true);
      setResult(null);
      setError(null);
      setTranscriptId(null);
      setPollingCount(0);
      
      console.log('Selected file:', file.name, file.type, file.size);
      
      // Create form data with the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file for processing
      const response = await fetch('/api/conversation', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload audio file');
      }
      
      console.log('Upload successful, transcript ID:', data.transcript_id);
      setTranscriptId(data.transcript_id);
    } catch (error) {
      console.error('Error uploading audio:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload audio file');
      setIsLoading(false);
    }
  };

  const checkTranscriptionStatus = async () => {
    if (!transcriptId) return;
    
    try {
      setPollingCount(prev => prev + 1);
      console.log(`Polling attempt ${pollingCount + 1} for transcript: ${transcriptId}`);
      
      const response = await fetch(`/api/conversation/${transcriptId}`);
      
      if (!response.ok) {
        throw new Error('Failed to check transcription status');
      }
      
      const data = await response.json();
      console.log('Transcription status:', data.status);
      
      // If transcription is complete
      if (data.status === 'completed') {
        console.log('Transcription completed!');
        setResult({
          transcript: data.transcript || 'No transcript available',
          diarization: data.diarization || 'No speaker identification available',
        });
        setIsLoading(false);
        
        // Stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } 
      // If transcription failed
      else if (data.status === 'error') {
        setError('Transcription failed: ' + (data.error || 'Unknown error'));
        setIsLoading(false);
        
        // Stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
      // If we've been polling for too long (over 2 minutes)
      else if (pollingCount > 40) {
        setError('Transcription is taking too long. Please try again later.');
        setIsLoading(false);
        
        // Stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error checking transcription status:', error);
      setError('Failed to check transcription status');
      setIsLoading(false);
      
      // Stop polling on error
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Conversation Analysis</h2>
        <p className="text-sm text-gray-500">
          Upload an audio file to convert speech to text and identify speakers.
        </p>
      </div>

      <FileUpload
        acceptedFileTypes=".mp3,.wav,.m4a,.ogg"
        onFileSelect={handleFileSelect}
        isLoading={isLoading}
      />

      {isLoading && (
        <Card className="p-6">
          <div className="text-center">
            <Loading />
            <p className="mt-2 text-sm text-gray-500">
              Processing audio... This may take a minute.
            </p>
            {transcriptId && (
              <p className="mt-1 text-xs text-gray-400">
                Transcript ID: {transcriptId}
              </p>
            )}
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {result && (
        <Card className="p-4">
          <Tabs defaultValue="transcript">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="diarization">Diarization</TabsTrigger>
            </TabsList>
            <TabsContent value="transcript" className="p-4">
              <ResultCard 
                title="Transcript" 
                content={result.transcript}
                onCopy={() => copyToClipboard(result.transcript)}
              />
            </TabsContent>
            <TabsContent value="diarization" className="p-4">
              <ResultCard 
                title="Speaker Identification" 
                content={result.diarization}
                onCopy={() => copyToClipboard(result.diarization)}
              />
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}