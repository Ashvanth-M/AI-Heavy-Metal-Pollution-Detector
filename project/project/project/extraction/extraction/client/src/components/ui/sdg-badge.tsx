import React from 'react';

export function SDGBadge({ badge, selected, onClick }: any) {
  return (
    <div
      className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor: badge.color }}
      onClick={onClick}
    >
      {badge.badgeNumber}
    </div>
  );
}