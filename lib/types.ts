export type SkillType = 'conversation' | 'image' | 'document';

export interface Skill {
  id: SkillType;
  name: string;
  description: string;
  acceptedFileTypes: string;
  icon: string;
}

export const skills: Skill[] = [
  {
    id: 'conversation',
    name: 'Conversation Analysis',
    description: 'Upload audio files to convert speech to text and identify speakers.',
    acceptedFileTypes: '.mp3,.wav,.m4a,.ogg',
    icon: '🎙️'
  },
  {
    id: 'image',
    name: 'Image Analysis',
    description: 'Upload images to generate detailed descriptions.',
    acceptedFileTypes: '.jpg,.jpeg,.png,.webp',
    icon: '🖼️'
  },
  {
    id: 'document',
    name: 'Document Summarization',
    description: 'Upload documents or provide URLs to get concise summaries.',
    acceptedFileTypes: '.pdf,.doc,.docx,.txt',
    icon: '📄'
  }
];