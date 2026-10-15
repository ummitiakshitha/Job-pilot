import React from 'react';

export const StatCardSkeleton = () => (
  <div className="p-6 rounded-2xl bg-white border border-sand-200/80 shadow-card animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-3.5 w-24 bg-sand-100 rounded-md" />
      <div className="w-10 h-10 bg-sand-100 rounded-xl" />
    </div>
    <div className="h-8 w-16 bg-sand-200/80 rounded-md mb-2" />
    <div className="h-3.5 w-36 bg-sand-100 rounded-md" />
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="border-b border-sand-200/60 animate-pulse">
    <td className="py-4 px-5"><div className="h-4 w-32 bg-sand-100 rounded-md" /></td>
    <td className="py-4 px-4"><div className="h-6 w-20 bg-sand-100 rounded-full" /></td>
    <td className="py-4 px-4"><div className="h-4 w-16 bg-sand-100 rounded-md" /></td>
    <td className="py-4 px-4"><div className="h-4 w-24 bg-sand-100 rounded-md" /></td>
    <td className="py-4 px-4"><div className="h-4 w-24 bg-sand-100 rounded-md" /></td>
    <td className="py-4 px-5"><div className="h-7 w-20 bg-sand-100 rounded-lg ml-auto" /></td>
  </tr>
);

export const ChartSkeleton = () => (
  <div className="p-6 rounded-2xl bg-white border border-sand-200/80 shadow-card animate-pulse h-80 flex flex-col justify-between">
    <div className="h-5 w-44 bg-sand-100 rounded-md" />
    <div className="w-full h-48 bg-ivory-50 rounded-xl flex items-center justify-center">
      <div className="w-32 h-32 rounded-full border-4 border-sand-200/60" />
    </div>
    <div className="h-4 w-52 bg-sand-100 rounded-md self-center" />
  </div>
);
