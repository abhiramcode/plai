import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ResultCardProps {
  title: string;
  content: string;
  onCopy?: () => void;
}

export function ResultCard({ title, content, onCopy }: ResultCardProps) {
  return (
    <Card className="p-4 space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{title}</h3>
        {onCopy && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCopy}
            className="text-xs"
          >
            Copy
          </Button>
        )}
      </div>
      <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
        {content}
      </div>
    </Card>
  );
}