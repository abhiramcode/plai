"use client";

import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { UrlInput } from '@/components/ui/url-input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function DocumentSummarization() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    source: string;
    summary: string;
  } | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    // This will be implemented in Phase 5
    // For now, just simulate a delay
    setTimeout(() => {
      setResult({
        source: file.name,
        summary: "This is a placeholder summary of the document."
      });
      setIsLoading(false);
    }, 2000);
  };

  const handleUrlSubmit = async (url: string) => {
    setIsLoading(true);
    // This will be implemented in Phase 5
    // For now, just simulate a delay
    setTimeout(() => {
      setResult({
        source: url,
        summary: "This is a placeholder summary of the URL content."
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Document Summarization</h2>
        <p className="text-sm text-gray-500">
          Upload a document or provide a URL to get a concise summary.
        </p>
      </div>

      <Tabs defaultValue="file">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Upload File</TabsTrigger>
          <TabsTrigger value="url">Enter URL</TabsTrigger>
        </TabsList>
        <TabsContent value="file" className="pt-4">
          <FileUpload
            acceptedFileTypes=".pdf,.doc,.docx,.txt"
            onFileSelect={handleFileSelect}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="url" className="pt-4">
          <UrlInput
            onUrlSubmit={handleUrlSubmit}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {result && (
        <Card className="p-4 space-y-4">
          <div>
            <h3 className="font-medium">Source:</h3>
            <p className="text-sm text-gray-600">{result.source}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Summary:</h3>
            <p>{result.summary}</p>
          </div>
        </Card>
      )}
    </div>
  );
}