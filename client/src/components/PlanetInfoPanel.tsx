import React, { useState, useEffect, type FormEvent } from 'react';
import './PlanetInfoPanel.css';

interface PlanetInfo {
  name: string;
  description: string;
  facts: string[];
}

interface PlanetInfoPanelProps {
  planet: PlanetInfo | null;
  onClose: () => void;
  panelPosition: { x: number; y: number } | null;
  showOtherPlanets: boolean;
  onToggleShowOtherPlanets: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const PlanetInfoPanel: React.FC<PlanetInfoPanelProps> = ({ planet, onClose, panelPosition, showOtherPlanets, onToggleShowOtherPlanets }) => {
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [errorAi, setErrorAi] = useState<string | null>(null);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (planet) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [planet]);

  useEffect(() => {
    setQuestion('');
    setAiResponse(null);
    setIsLoadingAi(false);
    setErrorAi(null);
  }, [planet]);

  const handleAskAi = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !planet) return;

    setIsLoadingAi(true);
    setErrorAi(null);
    setAiResponse(null);

    try {
      const fullPrompt = `Regarding ${planet.name}: ${question}`;

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch AI response');
      }

      const data = await response.json();
      setAiResponse(data.output || 'No valid response from AI.');

    } catch (err: any) {
      console.error("AI API Error:", err);
      setErrorAi(`Failed to get AI response: ${err.message}`);
    } finally {
      setIsLoadingAi(false);
    }
  };

  if (!planet && !isVisible) return null;

  const panelStyle: React.CSSProperties = panelPosition ? {
    left: `${panelPosition.x}px`,
    top: `${panelPosition.y}px`,
    transform: `translate(-50%, -50%) ${isVisible ? 'scale(1)' : 'scale(0.9)'}`,
    transformOrigin: 'center center'
  } : {};

  return (
    <div className={`planet-info-panel ${isVisible ? 'visible' : ''}`} style={panelStyle}>
      {/* Container untuk tombol tutup dan tombol toggle visibilitas */}
      <div className="panel-header-controls">
        <button className="toggle-visibility-button" onClick={onToggleShowOtherPlanets} title={showOtherPlanets ? 'Sembunyikan Planet Lain' : 'Tampilkan Planet Lain'}>
          {/* Ikon mata SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={showOtherPlanets ? 'eye-icon-visible' : 'eye-icon-hidden'}
          >
            {showOtherPlanets ? (
              // Mata terbuka
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            ) : (
              // Mata tertutup (dengan garis)
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a18.06 18.06 0 0 1 5-6.36M2 2l20 20M14.93 14.93A4 4 0 0 1 12 16c-1.31 0-2.5-.5-3.39-1.39" />
            )}
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        <button className="close-button" onClick={onClose} title="Tutup Panel">×</button>
      </div>

      <h2>{planet?.name}</h2>
      <p>{planet?.description}</p>
      <h3>Fakta:</h3>
      <ul>
        {planet?.facts.map((fact, index) => (
          <li key={index}>{fact}</li>
        ))}
      </ul>

      <div className="ai-chat-section">
        <h3>Tanya AI tentang {planet?.name}:</h3>
        <form onSubmit={handleAskAi}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Tanya sesuatu tentang ${planet?.name}...`}
            disabled={isLoadingAi}
          />
          <button type="submit" disabled={isLoadingAi}>
            {isLoadingAi ? 'Bertanya...' : 'Tanya'}
          </button>
        </form>
        {errorAi && <p className="ai-error">{errorAi}</p>}
        {aiResponse && <div className="ai-response">{aiResponse}</div>}
      </div>

      {/* panel-controls yang lama dihapus */}
      {/* <div className="panel-controls">
        <button onClick={onToggleShowOtherPlanets}>
          {showOtherPlanets ? 'Sembunyikan Planet Lain' : 'Tampilkan Planet Lain'}
        </button>
      </div> */}
    </div>
  );
};

export default PlanetInfoPanel;