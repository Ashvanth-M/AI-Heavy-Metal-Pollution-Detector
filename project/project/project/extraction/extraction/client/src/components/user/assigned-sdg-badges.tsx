import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SDGBadge } from '@/components/ui/sdg-badge';
import { mockSdgBadges, SampleSDGAssignment } from '@/data/sdg-badges';

interface Props {
  sampleId: string;
  assignments: SampleSDGAssignment[];
}

export function AssignedSDGBadges({ sampleId, assignments }: Props) {
  const sampleAssignments = assignments.filter(a => a.sampleId === sampleId);
  
  if (sampleAssignments.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No SDG badges assigned
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {sampleAssignments.map((assignment) => {
          const badge = mockSdgBadges.find(b => b.id === assignment.badgeId);
          if (!badge) return null;
          
          return (
            <div key={assignment.id} className="flex items-center gap-2">
              <SDGBadge badge={badge} />
              <span className="text-sm">{badge.name}</span>
            </div>
          );
        })}
      </div>
      <Badge variant="secondary" className="text-xs">
        {sampleAssignments.length} SDG{sampleAssignments.length !== 1 ? 's' : ''} assigned
      </Badge>
    </div>
  );
}