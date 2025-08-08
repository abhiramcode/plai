"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface UrlInputProps {
  onUrlSubmit: (url: string) => void;
  isLoading?: boolean;
}

export function UrlInput({ onUrlSubmit, isLoading = false }: UrlInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onUrlSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="url" className="text-sm font-medium">
          Enter URL
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !url.trim()}
      >
        {isLoading ? 'Processing...' : 'Process URL'}
      </Button>
    </form>
  );
}