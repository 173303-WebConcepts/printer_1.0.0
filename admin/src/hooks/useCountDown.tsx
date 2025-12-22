import { useState, useEffect, useMemo } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  hasEnded: boolean;
}
interface TimeLeftEnded {
  hasEnded: boolean;
}

function useCountdownParameterChanges(targetDate: string): TimeLeft {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();
    const hasEnded = difference <= 0;

    return {
      days: hasEnded ? 0 : Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: hasEnded ? 0 : Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: hasEnded ? 0 : Math.floor((difference / (1000 * 60)) % 60),
      seconds: hasEnded ? 0 : Math.floor((difference / 1000) % 60),
      total: difference,
      hasEnded,
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft()); // Reset countdown when targetDate changes

    const timerId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timerId); // Cleanup when targetDate changes or unmounts
  }, [targetDate]); // Re-run effect when targetDate changes

  return useMemo(() => timeLeft, [timeLeft]);
}

function useCountdown(targetDate: string): TimeLeft {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();
    const hasEnded = difference <= 0;

    return {
      days: hasEnded ? 0 : Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: hasEnded ? 0 : Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: hasEnded ? 0 : Math.floor((difference / (1000 * 60)) % 60),
      seconds: hasEnded ? 0 : Math.floor((difference / 1000) % 60),
      total: difference,
      hasEnded,
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft);

  useEffect(() => {
    if (timeLeft.hasEnded) return;

    const timerId = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, targetDate]);

  return useMemo(() => timeLeft, [timeLeft]);
}

function useCountdownHasEnded(targetDate: string): TimeLeftEnded {
  const calculateTimeLeft = (): boolean => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();
    return difference <= 0;
  };

  const [hasEnded, setHasEnded] = useState<boolean>(calculateTimeLeft());

  useEffect(() => {
    // Exit if the countdown has already ended
    if (hasEnded) return;

    // Set up an interval to check every second
    const intervalId = setInterval(() => {
      const ended = calculateTimeLeft();
      if (ended) {
        setHasEnded(true); // Update `hasEnded` state to true when time ends
        clearInterval(intervalId); // Clear interval once ended
      }
    }, 1000);

    return () => clearInterval(intervalId); // Clean up interval on unmount
  }, [targetDate, hasEnded]);

  return useMemo(() => ({ hasEnded }), [hasEnded]);
}

export { useCountdown, useCountdownHasEnded, useCountdownParameterChanges };
