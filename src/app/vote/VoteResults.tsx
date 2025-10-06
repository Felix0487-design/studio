import { Progress } from '@/components/ui/progress';
import type { VotingOption } from '@/lib/voting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VoteResultsProps {
  votes: { [key: string]: number };
  totalVotes: number;
  options: VotingOption[];
}

export default function VoteResults({ votes, totalVotes, options }: VoteResultsProps) {
  return (
    <Card className="max-w-2xl mx-auto shadow-lg bg-background/10 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <CardTitle className="text-center text-white">Puntuación Total</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {options.map(option => {
          const voteCount = votes[option.id] || 0;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          return (
            <div key={option.id}>
              <div className="flex justify-between items-center mb-1 text-sm">
                <p className="font-medium text-white">{option.name}</p>
                <p className="font-mono text-white/80">{percentage}% ({voteCount} voto/s)</p>
              </div>
              <Progress value={percentage} className="h-2" aria-label={`Porcentaje de votos para ${option.name}: ${percentage}%`} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
