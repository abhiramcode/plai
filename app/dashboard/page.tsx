"use client";

import { useState } from 'react';
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SkillSelector } from '@/components/skill-selector';
import { ConversationAnalysis } from '@/components/skills/conversation-analysis';
import { ImageAnalysis } from '@/components/skills/image-analysis';
import { DocumentSummarization } from '@/components/skills/document-summarization';
import { SkillType } from '@/lib/types';

export default function Dashboard() {
  const { userId, isLoaded } = useAuth();
  const [selectedSkill, setSelectedSkill] = useState<SkillType>('conversation');

  // Handle authentication
  if (isLoaded && !userId) {
    redirect("/sign-in");
  }

  // Render the appropriate skill component based on selection
  const renderSkillContent = () => {
    switch (selectedSkill) {
      case 'conversation':
        return <ConversationAnalysis />;
      case 'image':
        return <ImageAnalysis />;
      case 'document':
        return <DocumentSummarization />;
      default:
        return <ConversationAnalysis />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">PLAI</h1>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow sm:rounded-lg p-4 sm:p-6">
            <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Select a skill</h2>
            <SkillSelector onSkillChange={setSelectedSkill} />
            </div>
            
            <div className="mt-8">
            {renderSkillContent()}
            </div>
        </div>
      </main>
    </div>
  );
}