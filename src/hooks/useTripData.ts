// src/hooks/useTripData.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { API_ENDPOINTS } from '../config/api';
import type { Trip, Passenger, Site } from '../types';

// 15 minutes
const AUTO_REFRESH_INTERVAL = 15 * 60; // in seconds

export const useTripData = (userToken?: string) => {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NEW: refresh tracking
  const [timeLeft, setTimeLeft] = useState(AUTO_REFRESH_INTERVAL);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // fetchData now accepts a flag so silent refreshes don't toggle the loading spinner
  const fetchData = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) setLoading(true);
      setError(null);

      const headers = {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      };

      const [passengersRes, tripsRes, sitesRes] = await Promise.all([
        fetch(API_ENDPOINTS.PASSENGERS, { headers }),
        fetch(API_ENDPOINTS.TRIPS, { headers }),
        fetch(API_ENDPOINTS.SITES, { headers })
      ]);

      if (!passengersRes.ok) throw new Error('Failed to fetch passengers');
      if (!tripsRes.ok) throw new Error('Failed to fetch trips');
      if (!sitesRes.ok) throw new Error('Failed to fetch sites');

      const passengersData = await passengersRes.json();
      const tripsData = await tripsRes.json();
      const sitesData = await sitesRes.json();

      if (!isMountedRef.current) return;

      setPassengers(passengersData);
      setTrips(tripsData);
      setSites(sitesData);
      setLastUpdated(new Date()); // NEW: record successful fetch time
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      if (showSpinner && isMountedRef.current) setLoading(false);
    }
  }, [userToken]);

  // Master refresh: resets the countdown and re-fetches
  const refreshData = useCallback(async (showSpinner = false) => {
    setTimeLeft(AUTO_REFRESH_INTERVAL);
    await fetchData(showSpinner);
  }, [fetchData]);

  // Initial fetch on mount / token change
  useEffect(() => {
    isMountedRef.current = true;
    fetchData(true); // show spinner only on initial load
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData]);

  // Countdown timer — ticks every second, triggers refresh at 0
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up: silent background refresh
          refreshData(false);
          return AUTO_REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refreshData]);

  return {
    passengers,
    trips,
    sites,
    loading,
    error,
    fetchData,
    refreshData,   // NEW
    timeLeft,      // NEW
    lastUpdated,   // NEW
    setTrips,
    setPassengers
  };
};