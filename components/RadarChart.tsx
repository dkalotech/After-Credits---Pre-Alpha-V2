
import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { WeightedRating } from '../types';

interface Props {
  data: WeightedRating;
  size?: number;
}

const RatingRadar: React.FC<Props> = ({ data, size = 200 }) => {
  const chartData = useMemo(() => [
    { subject: 'Plot', A: data.plot, fullMark: 100 },
    { subject: 'Writing', A: data.writing, fullMark: 100 },
    { subject: 'Acting', A: data.acting, fullMark: 100 },
    { subject: 'Rewatch', A: data.rewatch, fullMark: 100 },
    { subject: 'Visuals', A: data.visuals, fullMark: 100 },
    { subject: 'Emotion', A: data.emotion, fullMark: 100 },
  ], [data]);

  return (
    <div style={{ width: '100%', height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="rgba(255,255,255,0.05)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#3a3a3c', fontSize: 9, fontWeight: 800, letterSpacing: '0.1em' }} />
          <Radar
            name="Rating"
            dataKey="A"
            stroke="#e50914"
            fill="#e50914"
            fillOpacity={0.4}
            animationDuration={1500}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RatingRadar;
