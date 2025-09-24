"use client";

import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Optionally import Box, Paper from "@mui/material" and use for wrappers

interface CountdownTimerProps {
  endTime: Date;
  compact?: boolean;
  className?: string;
  onExpire?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function CountdownTimer({
  endTime,
  compact = false,
  className,
  onExpire,
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = endTime.getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
        });
        onExpire?.();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, total: difference });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  // Check if auction is ending soon (less than 10 minutes)
  const isEndingSoon =
    timeRemaining.total <= 10 * 60 * 1000 && timeRemaining.total > 0;

  if (isExpired) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive border border-destructive/20",
          compact && "px-2 py-1 text-sm",
          className
        )}
      >
        <AlertTriangle className={cn("h-4 w-4", compact && "h-3 w-3")} />
        <span className="font-medium">Auction Ended</span>
      </div>
    );
  }

  const formatTime = () => {
    if (compact) {
      if (timeRemaining.days > 0) {
        return `${timeRemaining.days}d ${timeRemaining.hours}h`;
      }
      if (timeRemaining.hours > 0) {
        return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
      }
      return `${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
    }

    const parts = [];
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days}d`);
    if (timeRemaining.hours > 0) parts.push(`${timeRemaining.hours}h`);
    if (timeRemaining.minutes > 0) parts.push(`${timeRemaining.minutes}m`);
    if (timeRemaining.seconds > 0 || parts.length === 0)
      parts.push(`${timeRemaining.seconds}s`);

    return parts.join(" ");
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
        isEndingSoon
          ? "bg-destructive/10 text-destructive border border-destructive/20 auction-timer-warning"
          : "bg-background/90 backdrop-blur-sm border border-border/50",
        compact && "px-2 py-1 text-sm",
        className
      )}
    >
      <Clock
        className={cn(
          "h-4 w-4",
          compact && "h-3 w-3",
          isEndingSoon && "text-destructive"
        )}
      />
      <span className="font-medium">
        {compact ? "" : "Ends in "}
        {formatTime()}
      </span>
      {isEndingSoon && !compact && (
        <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
      )}
    </div>
  );
}

// Extended version for detail pages
export function DetailedCountdownTimer({
  endTime,
  onExpire,
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = endTime.getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
        });
        onExpire?.();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, total: difference });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  const isEndingSoon =
    timeRemaining.total <= 10 * 60 * 1000 && timeRemaining.total > 0;

  if (isExpired) {
    return (
      <div className="text-center p-8 rounded-lg bg-destructive/10 border border-destructive/20">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-2xl font-serif font-bold text-destructive mb-2">
          Auction Ended
        </h3>
        <p className="text-muted-foreground">
          This auction has concluded. Check back for new listings!
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "text-center p-6 rounded-lg border transition-all duration-300",
        isEndingSoon
          ? "bg-destructive/5 border-destructive/20 auction-timer-warning"
          : "bg-card border-border"
      )}
    >
      {isEndingSoon && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
          <span className="text-sm font-medium text-destructive">
            Auction Ending Soon!
          </span>
        </div>
      )}

      <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
        Time Remaining
      </h3>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div
            className={cn(
              "text-3xl font-bold font-mono",
              isEndingSoon ? "text-destructive" : "text-foreground"
            )}
          >
            {timeRemaining.days.toString().padStart(2, "0")}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Days
          </div>
        </div>
        <div className="text-center">
          <div
            className={cn(
              "text-3xl font-bold font-mono",
              isEndingSoon ? "text-destructive" : "text-foreground"
            )}
          >
            {timeRemaining.hours.toString().padStart(2, "0")}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Hours
          </div>
        </div>
        <div className="text-center">
          <div
            className={cn(
              "text-3xl font-bold font-mono",
              isEndingSoon ? "text-destructive" : "text-foreground"
            )}
          >
            {timeRemaining.minutes.toString().padStart(2, "0")}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Minutes
          </div>
        </div>
        <div className="text-center">
          <div
            className={cn(
              "text-3xl font-bold font-mono",
              isEndingSoon ? "text-destructive" : "text-foreground"
            )}
          >
            {timeRemaining.seconds.toString().padStart(2, "0")}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Seconds
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Auction ends on {endTime.toLocaleDateString()} at{" "}
        {endTime.toLocaleTimeString()}
      </p>
    </div>
  );
}
