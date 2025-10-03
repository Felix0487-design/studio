import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import type { VotingOption } from '@/lib/voting';
import { cn } from '@/lib/utils';

interface VoteCardProps {
  option: VotingOption;
  onVote: () => void;
  disabled: boolean;
  isSelected: boolean;
}

export default function VoteCard({ option, onVote, disabled, isSelected }: VoteCardProps) {
  // Extract the main title part for the button
  const buttonLabel = option.name.startsWith('Opción B: ') ? option.name.substring(11) : 'Sacedón';

  return (
    <Card className={cn(
      "flex flex-col transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1",
      isSelected ? "border-primary ring-2 ring-primary shadow-xl" : "shadow-lg",
      disabled && !isSelected ? "opacity-60 saturate-[.8]" : "",
      "bg-card"
    )}>
      <CardHeader>
        <CardTitle className="text-xl text-primary">{option.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{option.description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onVote}
          disabled={disabled}
          className="w-full transition-colors"
          variant={isSelected ? "default" : "outline"}
        >
          {isSelected ? (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              ¡Votado!
            </>
          ) : (
            `Votar por ${buttonLabel}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
