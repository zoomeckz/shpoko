import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string | null;
  file_url: string;
  order_index: number;
}

// ============================================
// ADD YOUR MUSIC TRACKS HERE
// ============================================
// To add music, either:
// 1. Upload to Supabase storage and add to roguelike_music table
// 2. Or add URLs directly to this array:
const LOCAL_TRACKS: MusicTrack[] = [
  // Example:
  // {
  //   id: 'local-1',
  //   title: 'Adventure Theme',
  //   artist: 'Your Artist',
  //   file_url: '/music/adventure-theme.mp3',
  //   order_index: 1
  // },
];
// ============================================

export function useRadio() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch tracks from database
  useEffect(() => {
    const fetchTracks = async () => {
      const { data } = await supabase
        .from('roguelike_music')
        .select('*')
        .order('order_index');

      const dbTracks = (data || []) as MusicTrack[];
      setTracks([...LOCAL_TRACKS, ...dbTracks]);
    };

    fetchTracks();
  }, []);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    
    audioRef.current.addEventListener('ended', () => {
      nextTrack();
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update audio source when track changes
  useEffect(() => {
    if (audioRef.current && tracks.length > 0 && tracks[currentTrackIndex]) {
      audioRef.current.src = tracks[currentTrackIndex].file_url;
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentTrackIndex, tracks]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const play = useCallback(() => {
    if (audioRef.current && tracks.length > 0) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [tracks]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const nextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex(prev => (prev + 1) % tracks.length);
  }, [tracks.length]);

  const prevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex(prev => (prev - 1 + tracks.length) % tracks.length);
  }, [tracks.length]);

  const setVolumeLevel = useCallback((level: number) => {
    setVolume(Math.max(0, Math.min(1, level)));
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const currentTrack = tracks[currentTrackIndex] || null;

  return {
    tracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    volume,
    isMuted,
    play,
    pause,
    toggle,
    nextTrack,
    prevTrack,
    setVolume: setVolumeLevel,
    toggleMute
  };
}
