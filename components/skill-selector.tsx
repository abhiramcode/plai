"use client";

import { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { skills, SkillType } from '@/lib/types';

interface SkillSelectorProps {
  onSkillChange: (skillId: SkillType) => void;
}

export function SkillSelector({ onSkillChange }: SkillSelectorProps) {
  const [selectedSkill, setSelectedSkill] = useState<SkillType>('conversation');

  const handleSkillChange = (value: string) => {
    const skillId = value as SkillType;
    setSelectedSkill(skillId);
    onSkillChange(skillId);
  };

  return (
    <div className="w-full max-w-xs">
      <Select value={selectedSkill} onValueChange={handleSkillChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a skill" />
        </SelectTrigger>
        <SelectContent>
          {skills.map((skill) => (
            <SelectItem key={skill.id} value={skill.id}>
              <div className="flex items-center">
                <span className="mr-2">{skill.icon}</span>
                {skill.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}