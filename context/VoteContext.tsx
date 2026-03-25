import React, { createContext, useContext, useState } from 'react';

interface VoteContextValue {
  selections: Record<string, string[]>; // positionId -> candidateId[]
  toggle: (positionId: string, candidateId: string, maxVotes: number) => void;
  clear: () => void;
}

const VoteContext = createContext<VoteContextValue | null>(null);

export function VoteProvider({ children }: { children: React.ReactNode }) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  const toggle = (positionId: string, candidateId: string, maxVotes: number) => {
    setSelections(prev => {
      const current = prev[positionId] ?? [];
      if (current.includes(candidateId)) {
        return { ...prev, [positionId]: current.filter(id => id !== candidateId) };
      }
      if (current.length >= maxVotes) return prev;
      return { ...prev, [positionId]: [...current, candidateId] };
    });
  };

  const clear = () => setSelections({});

  return (
    <VoteContext.Provider value={{ selections, toggle, clear }}>
      {children}
    </VoteContext.Provider>
  );
}

export function useVote() {
  const ctx = useContext(VoteContext);
  if (!ctx) throw new Error('useVote must be used within VoteProvider');
  return ctx;
}
