import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  airDate: string;
  className?: string;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isAired: boolean;
}

const calculateTimeLeft = (airDate: string): TimeLeft => {
  const difference = new Date(airDate).getTime() - new Date().getTime();
  const isAired = difference <= 0;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isAired,
  };
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  airDate,
  className,
  compact = false
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(airDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(airDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [airDate]);

  const formatNumber = (num: number): string => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  if (timeLeft.isAired) {
    return (
      <div className={cn("text-sm font-medium text-green-600", className)}>
        Aired
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn("text-sm font-medium", className)}>
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
      </div>
    );
  }

  return (
    <div className={cn("flex space-x-3", className)}>
      <div className="flex flex-col items-center">
        <span className="text-3xl font-bold">{timeLeft.days}</span>
        <span className="text-xs text-muted-foreground mt-1">Days</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-3xl font-bold">{formatNumber(timeLeft.hours)}</span>
        <span className="text-xs text-muted-foreground mt-1">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-3xl font-bold">{formatNumber(timeLeft.minutes)}</span>
        <span className="text-xs text-muted-foreground mt-1">Minutes</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-3xl font-bold">{formatNumber(timeLeft.seconds)}</span>
        <span className="text-xs text-muted-foreground mt-1">Seconds</span>
      </div>
    </div>
  );
};