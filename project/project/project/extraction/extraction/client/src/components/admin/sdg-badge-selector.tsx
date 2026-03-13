import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SDGBadge } from '@/components/ui/sdg-badge';
import { mockSdgBadges } from '@/data/sdg-badges';

interface Props {
  selectedBadges: string[];
  onSelectionChange: (badgeIds: string[]) => void;
  onAssign: () => void;
}

export function SDGBadgeSelector({ selectedBadges, onSelectionChange, onAssign }: Props) {
  const toggleBadge = (badgeId: string) => {
    if (selectedBadges.includes(badgeId)) {
      onSelectionChange(selectedBadges.filter(id => id !== badgeId));
    } else {
      onSelectionChange([...selectedBadges, badgeId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select SDG Badges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-3 mb-4">
          {mockSdgBadges.map((badge) => (
            <SDGBadge
              key={badge.id}
              badge={badge}
              selected={selectedBadges.includes(badge.id)}
              onClick={() => toggleBadge(badge.id)}
            />
          ))}
        </div>
        <Button 
          onClick={onAssign} 
          disabled={selectedBadges.length === 0}
          className="w-full"
        >
          Assign Selected Badges ({selectedBadges.length})
        </Button>
      </CardContent>
    </Card>
  );
}