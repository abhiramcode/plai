"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FileUpload } from '@/components/ui/file-upload';
import { Card } from '@/components/ui/card';

export function ImageAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    imageUrl: string;
    description: string;
  } | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    // This will be implemented in Phase 4
    // For now, just simulate a delay and create a local URL
    const imageUrl = URL.createObjectURL(file);
    
    setTimeout(() => {
      setResult({
        imageUrl,
        description: "This is a placeholder image description."
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Image Analysis</h2>
        <p className="text-sm text-gray-500">
          Upload an image to generate a detailed description.
        </p>
      </div>

      <FileUpload
        acceptedFileTypes=".jpg,.jpeg,.png,.webp"
        onFileSelect={handleFileSelect}
        isLoading={isLoading}
      />

      {result && (
        <Card className="p-4 space-y-4">
          <div className="aspect-video relative overflow-hidden rounded-md">
            {/* Use a div with background image as a workaround for local blob URLs */}
            <div 
              style={{ 
                backgroundImage: `url(${result.imageUrl})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                width: '100%',
                height: '100%',
                minHeight: '200px'
              }}
            />
          </div>
          <div className="p-2 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Description:</h3>
            <p>{result.description}</p>
          </div>
        </Card>
      )}
    </div>
  );
}