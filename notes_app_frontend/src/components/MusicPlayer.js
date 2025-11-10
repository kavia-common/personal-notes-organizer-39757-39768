import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * MusicPlayer
 * - Upload MP3 files (client-side only)
 * - Validate extension .mp3
 * - Store library and playback state in localStorage (data URLs)
 * - List library, simple queue behavior
 * - Controls: play/pause, previous/next, seek, volume
 * - Displays basic metadata (filename, duration when available)
 */

const STORAGE_KEY_LIBRARY = 'music-library-v1';
const STORAGE_KEY_STATE = 'music-playback-state-v1';

// Lightweight id generator
const uid = () => Math.random().toString(36).slice(2, 10);

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

function loadLibrary() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIBRARY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLibrary(lib) {
  try {
    localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(lib));
  } catch {
    // ignore
  }
}

function loadPlaybackState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATE);
    return raw
      ? JSON.parse(raw)
      : {
          currentId: null,
          position: 0,
          volume: 0.9,
          queue: [],
        };
  } catch {
    return { currentId: null, position: 0, volume: 0.9, queue: [] };
  }
}

function savePlaybackState(state) {
  try {
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export default function MusicPlayer() {
  const [library, setLibrary] = useState(loadLibrary);
  const [state, setState] = useState(loadPlaybackState);
  const audioRef = useRef(null);

  const currentTrack = useMemo(
    () => library.find((t) => t.id === state.currentId) || null,
    [state.currentId, library]
  );

  // Keep volume synced
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
    }
  }, [state.volume]);

  // Persist changes
  useEffect(() => {
    saveLibrary(library);
  }, [library]);

  useEffect(() => {
    savePlaybackState(state);
  }, [state]);

  // On mount, if there is a current track, set src and seek
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentTrack) {
      audio.src = currentTrack.url;
      audio.currentTime = state.position || 0;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update src when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentTrack) {
      audio.src = currentTrack.url;
      audio.play().catch(() => {
        // autoplay may be blocked; user must press play
      });
    } else {
      audio.removeAttribute('src');
    }
  }, [currentTrack]);

  // Handlers
  // PUBLIC_INTERFACE
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const mp3s = files.filter((f) => /\.mp3$/i.test(f.name));
    const nonMp3Count = files.length - mp3s.length;
    if (nonMp3Count > 0) {
      alert('Only .mp3 files are accepted. Skipped non-mp3 files.');
    }
    for (const file of mp3s) {
      // convert to data URL for persistence
      // Note: For large libraries this increases localStorage usage. For production, prefer IndexedDB and Blob URLs.
      // Here we keep simplicity per requirements.
      const dataUrl = await readFileAsDataURL(file);
      const track = {
        id: uid(),
        name: file.name.replace(/\.mp3$/i, ''),
        fileName: file.name,
        url: dataUrl,
        duration: 0,
        createdAt: Date.now(),
      };
      setLibrary((prev) => [track, ...prev]);
      // If nothing is playing, set this as current and queue
      setState((s) => {
        if (!s.currentId) {
          return { ...s, currentId: track.id, queue: [track.id] };
        }
        return { ...s, queue: [...s.queue, track.id] };
      });
    }
    e.target.value = '';
  };

  // PUBLIC_INTERFACE
  const playTrack = (id) => {
    setState((s) => ({
      ...s,
      currentId: id,
      // if not in queue, append it
      queue: s.queue.includes(id) ? s.queue : [...s.queue, id],
    }));
  };

  // PUBLIC_INTERFACE
  const removeTrack = (id) => {
    setLibrary((prev) => prev.filter((t) => t.id !== id));
    setState((s) => {
      const newQueue = s.queue.filter((q) => q !== id);
      const newState = { ...s, queue: newQueue };
      if (s.currentId === id) {
        newState.currentId = newQueue[0] || null;
        newState.position = 0;
      }
      return newState;
    });
  };

  // PUBLIC_INTERFACE
  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setState((s) => ({ ...s, position: audio.currentTime }));
  };

  // PUBLIC_INTERFACE
  const onLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    // store duration
    setLibrary((prev) =>
      prev.map((t) => (t.id === currentTrack.id ? { ...t, duration: audio.duration } : t))
    );
  };

  // PUBLIC_INTERFACE
  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        // ignore
      }
    } else {
      audio.pause();
    }
  };

  // PUBLIC_INTERFACE
  const playNext = () => {
    const { queue, currentId } = state;
    if (!queue.length) return;
    const idx = queue.indexOf(currentId);
    const nextId = idx >= 0 && idx < queue.length - 1 ? queue[idx + 1] : queue[0];
    setState((s) => ({ ...s, currentId: nextId, position: 0 }));
  };

  // PUBLIC_INTERFACE
  const playPrev = () => {
    const { queue, currentId } = state;
    if (!queue.length) return;
    const idx = queue.indexOf(currentId);
    const prevId = idx > 0 ? queue[idx - 1] : queue[queue.length - 1];
    setState((s) => ({ ...s, currentId: prevId, position: 0 }));
  };

  // PUBLIC_INTERFACE
  const onSeek = (e) => {
    const val = Number(e.target.value || 0);
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = val;
    setState((s) => ({ ...s, position: val }));
  };

  // PUBLIC_INTERFACE
  const onVolume = (e) => {
    const v = Number(e.target.value);
    setState((s) => ({ ...s, volume: v }));
    if (audioRef.current) audioRef.current.volume = v;
  };

  // PUBLIC_INTERFACE
  const onEnded = () => {
    playNext();
  };

  const humanTime = (n) => {
    if (!Number.isFinite(n)) return '0:00';
    const mm = Math.floor(n / 60);
    const ss = Math.floor(n % 60)
      .toString()
      .padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const isPlaying = () => {
    const audio = audioRef.current;
    return audio && !audio.paused;
  };

  return (
    <div className="music-wrap">
      <div className="music-toolbar">
        <div className="left">
          <label className="ocean-btn" htmlFor="mp3-input" title="Upload MP3 files">
            ⬆ Upload MP3
          </label>
          <input
            id="mp3-input"
            type="file"
            accept=".mp3,audio/mpeg"
            multiple
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
        </div>
        <div className="center">
          <div className="music-nowplaying" aria-live="polite">
            {currentTrack ? (
              <>
                <span className="np-title">{currentTrack.name}</span>
                <span className="np-sep">•</span>
                <span className="np-filename">{currentTrack.fileName}</span>
              </>
            ) : (
              <span className="np-empty">No track selected</span>
            )}
          </div>
        </div>
        <div className="right">
          <div className="volume">
            <span aria-hidden>🔈</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.volume}
              onChange={onVolume}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>

      <div className="music-player">
        <div className="controls">
          <button className="ocean-btn secondary" onClick={playPrev} aria-label="Previous">
            «
          </button>
          <button className="ocean-btn primary" onClick={togglePlayPause} aria-label="Play/Pause">
            {isPlaying() ? '⏸' : '▶️'}
          </button>
          <button className="ocean-btn secondary" onClick={playNext} aria-label="Next">
            »
          </button>
        </div>
        <div className="seek">
          <span className="time">{humanTime(state.position)}</span>
          <input
            type="range"
            min="0"
            max={currentTrack && Number.isFinite(currentTrack.duration) ? currentTrack.duration : 0}
            step="0.1"
            value={Math.min(
              state.position,
              currentTrack && Number.isFinite(currentTrack.duration) ? currentTrack.duration : 0
            )}
            onChange={onSeek}
            aria-label="Seek"
          />
          <span className="time">
            {currentTrack && Number.isFinite(currentTrack.duration)
              ? humanTime(currentTrack.duration)
              : '0:00'}
          </span>
        </div>
        <audio
          ref={audioRef}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onEnded}
        />
      </div>

      <div className="music-library">
        <div className="lib-header">
          <h3 className="lib-title">Library</h3>
          <span className="lib-count">{library.length}</span>
        </div>
        {library.length === 0 ? (
          <div className="lib-empty">Upload some MP3 files to build your local library.</div>
        ) : (
          <ul className="lib-list">
            {library.map((t) => (
              <li
                key={t.id}
                className={`lib-item ${state.currentId === t.id ? 'active' : ''}`}
              >
                <button
                  className="lib-play"
                  onClick={() => playTrack(t.id)}
                  aria-label={`Play ${t.name}`}
                >
                  {state.currentId === t.id && isPlaying() ? '⏸' : '▶️'}
                </button>
                <div className="lib-meta" onClick={() => playTrack(t.id)} role="button" tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? playTrack(t.id) : null)}
                >
                  <div className="lib-name">{t.name}</div>
                  <div className="lib-sub">
                    <span className="file">{t.fileName}</span>
                    <span className="dot">·</span>
                    <span className="dur">{t.duration ? `${Math.round(t.duration)}s` : '—'}</span>
                  </div>
                </div>
                <button
                  className="lib-remove ocean-btn ghost"
                  onClick={() => removeTrack(t.id)}
                  aria-label={`Remove ${t.name}`}
                  title="Remove from library"
                >
                  ✖
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
