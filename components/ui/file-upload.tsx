"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FileUploadProps {
  acceptedFileTypes: string;
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function FileUpload({ acceptedFileTypes, onFileSelect, isLoading = false }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.split(',').reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles: 1,
    disabled: isLoading
  });

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card 
        {...getRootProps()} 
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="text-3xl">📁</div>
          {selectedFile ? (
            <p className="text-sm font-medium">{selectedFile.name}</p>
          ) : (
            <>
              <p className="font-medium">Drag & drop a file here, or click to select</p>
              <p className="text-sm text-gray-500">
                Supported formats: {acceptedFileTypes.replace(/\./g, '')}
              </p>
            </>
          )}
        </div>
      </Card>
      
      {selectedFile && (
        <Button 
          onClick={handleUpload} 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Process File'}
        </Button>
      )}
    </div>
  );
}