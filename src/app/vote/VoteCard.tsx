
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import type { VotingOption } from '@/lib/voting';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface VoteCardProps {
  option: VotingOption;
  onVote: (optionId: string) => void;
  disabled: boolean;
  isSelected: boolean;
}

export default function VoteCard({ option, onVote, disabled, isSelected }: VoteCardProps) {

  return (
    <Card className={cn(
      "flex flex-col transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1",
      isSelected ? "border-primary ring-2 ring-primary shadow-xl bg-primary/20" : "shadow-lg border-white/20",
      "bg-background/10 backdrop-blur-sm text-white overflow-hidden"
    )}>
      {option.imageUrl && (
        <div className="relative w-full h-40">
           <Image
            src={option.imageUrl}
            alt={option.name}
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint={option.imageHint}
           />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl text-accent">{option.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-white/90">{option.description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onVote(option.id)}
          disabled={disabled}
          className="w-full transition-colors"
          variant={isSelected ? "default" : "default"}
        >
          {isSelected ? (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Votado
            </>
          ) : (
            `Votar por esta opción`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
