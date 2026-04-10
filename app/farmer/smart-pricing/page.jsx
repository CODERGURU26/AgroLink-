'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import styles from './smart-pricing.module.css';

export default function SmartPricingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [locStatus, setLocStatus] = useState('detecting');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'farmer')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    // Try to get user's actual location
    if (navigator.geolocation) {
      setLocStatus('detecting');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocStatus('found');
          fetchWeatherData(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Location denied — use default (Pune, MH)
          setLocStatus('default');
          fetchWeatherData(18.52, 73.86);
        },
        { timeout: 10000 }
      );
    } else {
      setLocStatus('default');
      fetchWeatherData(18.52, 73.86);
    }
  }, [user]);

  const fetchWeatherData = async (lat, lon) => {
    try {
      const res = await fetch(`/api/weather-pricing?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError(e.message || 'Unable to load weather data');
    }
  };

  if (loading || !user) return null;

  if (error) return (
    <div className={styles.pricingWrap}>
      <div className="page-container">
        <div className={styles.header}>
          <h1>🌦️ Weather-Smart Pricing</h1>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        </div>
      </div>
    </div>
  );

  if (!data) return (
    <div className={styles.pricingWrap}>
      <div className="page-container">
        <div className={styles.header}>
          <h1>🌦️ Weather-Smart Pricing</h1>
          <p>
            {locStatus === 'detecting' ? '📍 Detecting your location...' : 'Loading live weather data...'}
          </p>
        </div>
      </div>
    </div>
  );

  const { weather, cropAnalysis, advisory } = data;

  const getAdvisoryClass = () => {
    if (weather.type === 'heavy_rain') return styles.danger;
    if (weather.type === 'heatwave') return styles.warning;
    if (weather.type === 'cold_wave') return styles.info;
    return styles.normal;
  };

  return (
    <div className={styles.pricingWrap}>
      <div className="page-container">
        {/* Header */}
        <div className={styles.header}>
          <h1>🌦️ Weather-Smart Pricing</h1>
          <p>Live weather data from your location combined with mandi prices for selling recommendations.</p>
          <div className={styles.liveTag}>
            <span className={styles.liveDot}></span>
            LIVE — {weather.source}
          </div>
        </div>

        {/* Weather Card */}
        <div className={styles.weatherCard}>
          <div className={styles.weatherMain}>
            <div className={styles.weatherIcon}>{weather.icon}</div>
            <div className={styles.weatherInfo}>
              <h2>{weather.condition}</h2>
              <div className={styles.weatherTemp}>
                {weather.temperature}° <span>C</span>
              </div>
              <div className={styles.weatherRegion}>📍 {weather.region}</div>
            </div>
          </div>
          <div className={styles.weatherMetrics}>
            <div className={styles.weatherMetric}>
              <div className="value">💧 {weather.humidity}%</div>
              <div className="label">Humidity</div>
            </div>
            <div className={styles.weatherMetric}>
              <div className="value">🌧️ {weather.rainfall}mm</div>
              <div className="label">Precipitation</div>
            </div>
            <div className={styles.weatherMetric}>
              <div className="value">💨 {weather.windSpeed} km/h</div>
              <div className="label">Wind Speed</div>
            </div>
          </div>
        </div>

        {/* Advisory */}
        <div className={`${styles.advisory} ${getAdvisoryClass()}`}>
          {advisory}
        </div>

        {/* 7-Day Forecast Strip */}
        <div className={styles.forecastStrip}>
          <div className={`${styles.forecastDay} ${styles.today}`}>
            <div className={styles.dayLabel}>Today</div>
            <div className={styles.dayIcon}>{weather.icon}</div>
            <div className={styles.dayTemp}>{weather.temperature}°</div>
            <div className={styles.dayCondition}>{weather.condition}</div>
          </div>
          {weather.forecast.map((day, i) => (
            <div key={i} className={styles.forecastDay}>
              <div className={styles.dayLabel}>{day.day}</div>
              <div className={styles.dayIcon}>{day.icon}</div>
              <div className={styles.dayTemp}>{day.tempMax}°/{day.tempMin}°</div>
              <div className={styles.dayCondition}>{day.condition}</div>
            </div>
          ))}
        </div>

        {/* Crop Analysis */}
        <h2 className={styles.analysisTitle}>📊 Weather Impact on Crop Prices</h2>
        <div className={styles.cropGrid}>
          {cropAnalysis.map(crop => (
            <div key={crop.crop} className={styles.cropCard}>
              <div className={styles.cropHeader}>
                <span className={styles.cropName}>{crop.crop}</span>
                <span className={`${styles.priceChangeBadge} ${
                  crop.priceImpactPct > 0 ? styles.up : crop.priceImpactPct < 0 ? styles.down : styles.neutral
                }`}>
                  {crop.priceImpactPct > 0 ? '▲' : crop.priceImpactPct < 0 ? '▼' : '—'} {Math.abs(crop.priceImpactPct)}%
                </span>
              </div>

              <div className={styles.priceRow}>
                <div>
                  <div className={styles.priceLabel}>Mandi Price ({crop.mandiMarket})</div>
                  <div className={`${styles.priceValue} ${styles.base}`}>₹{crop.basePrice.toLocaleString('en-IN')}/q</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={styles.priceLabel}>Weather-Adjusted</div>
                  <div className={`${styles.priceValue} ${styles.adjusted}`}>₹{crop.adjustedPrice.toLocaleString('en-IN')}/q</div>
                </div>
              </div>

              {/* Impact meter */}
              <div className={styles.impactMeter}>
                <div
                  className={`${styles.impactFill} ${
                    crop.priceImpactPct > 0 ? styles.positive : crop.priceImpactPct < 0 ? styles.negative : styles.neutral
                  }`}
                  style={{ width: `${Math.min(100, Math.abs(crop.priceImpactPct) * 3)}%` }}
                ></div>
              </div>

              <p className={styles.cropInsight}>💡 {crop.insight}</p>

              <div className={`${styles.sellBadge} ${styles[crop.sellUrgency]}`}>
                {crop.sellUrgency === 'high' ? '🟢' : crop.sellUrgency === 'medium' ? '🟡' : '🔴'} {crop.sellRecommendation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
