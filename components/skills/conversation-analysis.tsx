"use client";

import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResultCard } from '@/components/ui/result-card';
import { Loading } from '@/components/ui/loading';

export function ConversationAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [transcriptId, setTranscriptId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [result, setResult] = useState<{
    transcript: string;
    diarization: string;
  } | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // In the handleFileSelect function:

  const handleFileSelect = async (file: File) => {
    try {
      setIsLoading(true);
      setResult(null);
      
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
      
      // Start polling for results
      const interval = setInterval(checkTranscriptionStatus, 3000);
      setPollingInterval(interval);
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to upload audio file'}`);
      setIsLoading(false);
    }
  };

  const checkTranscriptionStatus = async () => {
    if (!transcriptId) return;
    
    try {
      const response = await fetch(`/api/conversation/${transcriptId}`);
      
      if (!response.ok) {
        throw new Error('Failed to check transcription status');
      }
      
      const data = await response.json();
      
      // If transcription is complete
      if (data.status === 'completed') {
        setResult({
          transcript: data.transcript,
          diarization: data.diarization,
        });
        setIsLoading(false);
        
        // Stop polling
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
    } catch (error) {
      console.error('Error checking transcription status:', error);
      setIsLoading(false);
      
      // Stop polling on error
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
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
          </div>
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