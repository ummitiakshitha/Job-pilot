import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { PieChart as PieIcon, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_COLORS = {
  Applied: '#0D9488',
  Interview: '#D97706',
  Offer: '#15803D',
  Rejected: '#DC2626',
};

// Refined Light Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="p-3 rounded-xl bg-white border border-sand-200 shadow-elevated text-xs">
        <p className="font-bold text-forest-950 mb-0.5">{data.name || data.payload.month}</p>
        <p className="text-stone-600 font-medium">
          Applications: <span className="font-bold text-forest-800">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const StatusDistributionChart = ({
  statusDistribution = [],
  monthlyTrends = [],
}) => {
  const [chartType, setChartType] = useState('pie'); // 'pie' | 'bar'

  const activeData = statusDistribution.filter((item) => item.count > 0);
  const hasData = activeData.length > 0 || monthlyTrends.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="p-6 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col h-full"
    >
      {/* Chart Header & Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-forest-950 font-sans">Application Analytics</h3>
          <p className="text-xs text-stone-500 font-medium">
            {chartType === 'pie'
              ? 'Status distribution breakdown'
              : 'Monthly submission activity'}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-ivory-100 border border-sand-200">
          <button
            onClick={() => setChartType('pie')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
              chartType === 'pie'
                ? 'bg-white text-forest-900 shadow-sm'
                : 'text-stone-500 hover:text-forest-900'
            }`}
            title="Status Donut Chart"
          >
            <PieIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
              chartType === 'bar'
                ? 'bg-white text-forest-900 shadow-sm'
                : 'text-stone-500 hover:text-forest-900'
            }`}
            title="Monthly Activity Bar Chart"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Body */}
      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400 min-h-[240px]">
          <p className="text-sm font-medium">No activity recorded yet.</p>
          <p className="text-xs text-stone-400 mt-1">
            Track applications to view live pipeline breakdown.
          </p>
        </div>
      ) : chartType === 'pie' ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[260px]">
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                >
                  {statusDistribution.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] || '#244D39'}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-3">
            {statusDistribution.map((item) => (
              <div key={item.status} className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[item.status] }}
                />
                <span>{item.status}:</span>
                <span className="font-bold text-stone-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-[260px] pt-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9E6DC" vertical={false} />
              <XAxis dataKey="month" stroke="#797568" fontSize={11} tickLine={false} />
              <YAxis stroke="#797568" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#244D39" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default StatusDistributionChart;
