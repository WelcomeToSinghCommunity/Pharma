import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Maximize, Minimize, Pause, Play, PlayCircle,
  Volume2, VolumeX, PictureInPicture2,
} from 'lucide-react';
import { supabase, hasSupabaseConfig } from '../lib/supabase.js';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function fmtTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function VideoPlayer({ src, courseId, videoId, title, subtitlesUrl, user }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const saveTimer = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [resumeFrom, setResumeFrom] = useState(null);

  // Load saved progress on mount
  useEffect(() => {
    if (!hasSupabaseConfig || !user || !videoId) return;
    supabase
      .from('video_progress')
      .select('timestamp_seconds')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .single()
      .then(({ data }) => {
        if (data && data.timestamp_seconds > 5) setResumeFrom(data.timestamp_seconds);
      });
  }, [user, videoId]);

  function handleLoadedMetadata() {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration ?? 0);
    if (resumeFrom) v.currentTime = resumeFrom;
  }

  const saveProgress = useCallback(async (ts, completed = false) => {
    if (!hasSupabaseConfig || !user || !videoId) return;
    await supabase.from('video_progress').upsert({
      user_id: user.id,
      course_id: courseId ?? null,
      video_id: videoId,
      timestamp_seconds: Math.floor(ts),
      completed,
      last_watched_at: new Date().toISOString(),
    }, { onConflict: 'user_id,video_id' });
  }, [user, videoId, courseId]);

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    if (duration > 0 && v.currentTime / duration >= 0.9) setShowComplete(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveProgress(v.currentTime), 10000);
  }

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }

  function handleSeek(e) {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  }

  function handleVolume(e) {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
    setMuted(val === 0);
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function changeSpeed(s) {
    setSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }

  function togglePiP() {
    if (!videoRef.current) return;
    if (document.pictureInPictureElement) document.exitPictureInPicture();
    else videoRef.current.requestPictureInPicture?.();
  }

  useEffect(() => {
    function onKey(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const v = videoRef.current;
      if (!v) return;
      if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.key === 'ArrowRight') v.currentTime = Math.min(v.currentTime + 10, duration);
      if (e.key === 'ArrowLeft') v.currentTime = Math.max(v.currentTime - 10, 0);
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (e.key === 'm' || e.key === 'M') toggleMute();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duration]);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div ref={containerRef} className="video-player-wrap">
      {buffering && (
        <div className="video-spinner"><div className="spinner" /></div>
      )}
      <video
        ref={videoRef}
        src={src}
        className="w-full rounded-t block"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onClick={togglePlay}
        controlsList="nodownload"
        playsInline
      >
        {subtitlesUrl && <track kind="subtitles" src={subtitlesUrl} default />}
      </video>

      <div className="video-controls">
        <div className="video-progress" onClick={handleSeek} role="slider"
          aria-label="Seek" aria-valuenow={Math.floor(currentTime)} aria-valuemax={Math.floor(duration)}>
          <div className="video-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="video-controls-row">
          <button onClick={togglePlay} className="icon-btn" aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <span className="video-time">{fmtTime(currentTime)} / {fmtTime(duration)}</span>
          <button onClick={toggleMute} className="icon-btn" aria-label="Toggle mute">
            {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
            onChange={handleVolume} className="video-volume" aria-label="Volume" />
          <select value={speed} onChange={e => changeSpeed(parseFloat(e.target.value))}
            className="video-speed" aria-label="Playback speed">
            {SPEEDS.map((s) => <option key={s} value={s}>{s}x</option>)}
          </select>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={togglePiP} className="icon-btn" aria-label="Picture in picture">
              <PictureInPicture2 size={16} />
            </button>
            <button onClick={toggleFullscreen} className="icon-btn" aria-label="Fullscreen">
              {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>

      {showComplete && (
        <div className="mt-3 flex items-center gap-3 rounded border border-teal/30 bg-teal/5 px-4 py-3">
          <PlayCircle size={20} className="text-teal" />
          <span className="flex-1 text-sm font-semibold text-teal">You've watched 90% — ready to mark complete?</span>
          <button className="btn btn-teal text-sm" onClick={() => saveProgress(currentTime, true)}>
            Mark Complete
          </button>
        </div>
      )}
    </div>
  );
}
