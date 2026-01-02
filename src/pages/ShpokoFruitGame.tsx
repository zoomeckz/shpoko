import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ShpokoFruitGame = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'loading' | 'menu' | 'playing' | 'paused'>('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['food']);
  const [emojis, setEmojis] = useState<any[]>([]);
  const [slicedWords, setSlicedWords] = useState<any[]>([]);
  const [isSlicing, setIsSlicing] = useState(false);
  const [slicePath, setSlicePath] = useState<{x: number; y: number}[]>([]);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [difficulty, setDifficulty] = useState(1);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const musicTracks = [
    { title: "SHPOKO - Bin", url: "https://github.com/Anyonebutsam/awsoon/raw/main/src/Shpoko%20-%20Bin.mp3" },
    { title: "SHPOKO - Claws", url: "https://github.com/Anyonebutsam/awsoon/raw/main/src/Shpoko%20-%20Claws.mp3" },
    { title: "SHPOKO - Ears", url: "https://github.com/Anyonebutsam/awsoon/raw/main/src/Shpoko%20-%20Ears.mp3" },
    { title: "SHPOKO - Food", url: "https://github.com/Anyonebutsam/awsoon/raw/main/src/Shpoko%20-%20Food.mp3" },
    { title: "SHPOKO - Friend", url: "https://github.com/Anyonebutsam/awsoon/raw/main/src/Shpoko%20-%20Friend.mp3" },
    { title: "SHPOKO - Furr", url: "https://github.com/Anyonebutsam/awsoon/raw/main/src/Shpoko%20-%20Furr.mp3" },
    { title: "SHPOKO - Home", url: "https://github.com/Anyonebutsam/awsoon/raw/main/src/Shpoko%20-%20Home.mp3" },
    { title: "SHPOKO - Noise", url: "https://github.com/Anyonebutsam/awsoon/raw/main/src/Shpoko%20-%20Noise.mp3" },
    { title: "SHPOKO - Smell", url: "https://github.com/Anyonebutsam/awsoon/raw/main/src/Shpoko%20-%20Smell.mp3" }
  ];

  const topics: Record<string, {emoji: string; word: string; meaning: string}[]> = {
    food: [
      { emoji: '🍎', word: 'ябълка', meaning: 'apple' },
      { emoji: '🍌', word: 'банан', meaning: 'banana' },
      { emoji: '🍊', word: 'портокал', meaning: 'orange' },
      { emoji: '🍇', word: 'грозде', meaning: 'grapes' },
      { emoji: '🍓', word: 'ягода', meaning: 'strawberry' },
      { emoji: '🍉', word: 'диня', meaning: 'watermelon' },
      { emoji: '🍞', word: 'хляб', meaning: 'bread' },
      { emoji: '🧀', word: 'сирене', meaning: 'cheese' }
    ],
    animals: [
      { emoji: '🐱', word: 'котка', meaning: 'cat' },
      { emoji: '🐶', word: 'куче', meaning: 'dog' },
      { emoji: '🐦', word: 'птица', meaning: 'bird' },
      { emoji: '🐟', word: 'риба', meaning: 'fish' },
      { emoji: '🐻', word: 'мечка', meaning: 'bear' },
      { emoji: '🦊', word: 'лисица', meaning: 'fox' },
      { emoji: '🐰', word: 'заек', meaning: 'rabbit' },
      { emoji: '🦝', word: 'миеща мечка', meaning: 'raccoon' }
    ],
    objects: [
      { emoji: '📱', word: 'телефон', meaning: 'phone' },
      { emoji: '📚', word: 'книга', meaning: 'book' },
      { emoji: '✏️', word: 'молив', meaning: 'pencil' },
      { emoji: '🎒', word: 'раница', meaning: 'backpack' },
      { emoji: '⌚', word: 'часовник', meaning: 'watch' },
      { emoji: '🔑', word: 'ключ', meaning: 'key' },
      { emoji: '💡', word: 'крушка', meaning: 'light bulb' },
      { emoji: '🚗', word: 'кола', meaning: 'car' }
    ],
    nature: [
      { emoji: '🌳', word: 'дърво', meaning: 'tree' },
      { emoji: '🌸', word: 'цвете', meaning: 'flower' },
      { emoji: '🌞', word: 'слънце', meaning: 'sun' },
      { emoji: '🌙', word: 'луна', meaning: 'moon' },
      { emoji: '⭐', word: 'звезда', meaning: 'star' },
      { emoji: '🌊', word: 'вълна', meaning: 'wave' },
      { emoji: '🔥', word: 'огън', meaning: 'fire' },
      { emoji: '💧', word: 'капка', meaning: 'drop' }
    ]
  };

  // Initialize audio context for sound effects
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Loading screen effect
  useEffect(() => {
    if (gameState === 'loading') {
      const duration = 4000;
      const interval = 50;
      const steps = duration / interval;
      let currentStep = 0;

      const loadingInterval = setInterval(() => {
        currentStep++;
        const progress = (currentStep / steps) * 100;
        setLoadingProgress(progress);

        if (currentStep >= steps) {
          clearInterval(loadingInterval);
          setGameState('menu');
        }
      }, interval);

      return () => clearInterval(loadingInterval);
    }
  }, [gameState]);

  const playSliceSound = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  };

  const handleAudioPlay = () => {
    const audio = document.getElementById('game-audio') as HTMLAudioElement;
    if (audio) {
      audio.play();
      setMusicPlaying(true);
    }
  };

  const handleAudioPause = () => {
    const audio = document.getElementById('game-audio') as HTMLAudioElement;
    if (audio) {
      audio.pause();
      setMusicPlaying(false);
    }
  };

  const handleAudioEnded = () => {
    setCurrentTrack(prev => (prev + 1) % musicTracks.length);
  };

  const nextTrack = () => {
    setCurrentTrack(prev => (prev + 1) % musicTracks.length);
  };

  const previousTrack = () => {
    setCurrentTrack(prev => (prev - 1 + musicTracks.length) % musicTracks.length);
  };

  useEffect(() => {
    const audio = document.getElementById('game-audio') as HTMLAudioElement;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = document.getElementById('game-audio') as HTMLAudioElement;
    if (audio) {
      audio.load();
      if (musicPlaying) {
        audio.play();
      }
    }
  }, [currentTrack]);

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('menu');
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [gameState]);

  // Increase difficulty
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const difficultyInterval = setInterval(() => {
      setDifficulty(prev => Math.min(prev + 0.1, 3));
    }, 10000);

    return () => clearInterval(difficultyInterval);
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = setInterval(() => {
      const spawnChance = 0.03 * difficulty;
      if (Math.random() < spawnChance) {
        const allWords = selectedTopics.flatMap(topic => topics[topic]);
        const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
        
        setEmojis(prev => [...prev, {
          id: Date.now() + Math.random(),
          ...randomWord,
          x: Math.random() * 80 + 10,
          y: -10,
          velocityY: (Math.random() * 0.5 + 0.5) * difficulty,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 5
        }]);
      }

      setEmojis(prev => {
        const updated = prev.map(emoji => ({
          ...emoji,
          y: emoji.y + emoji.velocityY,
          rotation: emoji.rotation + emoji.rotationSpeed
        })).filter(emoji => {
          if (emoji.y > 110) {
            setMisses(m => m + 1);
            return false;
          }
          return true;
        });
        return updated;
      });

      setSlicedWords(prev => prev.map(word => ({
        ...word,
        opacity: word.opacity - 0.02
      })).filter(word => word.opacity > 0));

    }, 1000 / 60);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, selectedTopics, difficulty]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (gameState !== 'playing') return;
    setIsSlicing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setSlicePath([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSlicing || gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setSlicePath(prev => [...prev.slice(-10), newPoint]);

    emojis.forEach(emoji => {
      const emojiX = (emoji.x / 100) * rect.width;
      const emojiY = (emoji.y / 100) * rect.height;
      
      if (Math.abs(newPoint.x - emojiX) < 40 && Math.abs(newPoint.y - emojiY) < 40) {
        sliceEmoji(emoji);
      }
    });
  };

  const handleMouseUp = () => {
    setIsSlicing(false);
    setSlicePath([]);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (gameState !== 'playing') return;
    setIsSlicing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    setSlicePath([{ x: touch.clientX - rect.left, y: touch.clientY - rect.top }]);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSlicing || gameState !== 'playing') return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const newPoint = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    setSlicePath(prev => [...prev.slice(-10), newPoint]);

    emojis.forEach(emoji => {
      const emojiX = (emoji.x / 100) * rect.width;
      const emojiY = (emoji.y / 100) * rect.height;
      
      if (Math.abs(newPoint.x - emojiX) < 40 && Math.abs(newPoint.y - emojiY) < 40) {
        sliceEmoji(emoji);
      }
    });
  };

  const handleTouchEnd = () => {
    setIsSlicing(false);
    setSlicePath([]);
  };

  const sliceEmoji = (emoji: any) => {
    playSliceSound();
    setScore(s => s + 10);
    setEmojis(prev => prev.filter(e => e.id !== emoji.id));
    setSlicedWords(prev => [...prev, {
      id: emoji.id,
      word: emoji.word,
      meaning: emoji.meaning,
      x: emoji.x,
      y: emoji.y,
      opacity: 1
    }]);
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topic)) {
        return prev.filter(t => t !== topic);
      } else {
        return [...prev, topic];
      }
    });
  };

  const startGame = () => {
    if (selectedTopics.length === 0) return;
    setGameState('playing');
    setScore(0);
    setMisses(0);
    setEmojis([]);
    setSlicedWords([]);
    setTimeLeft(60);
    setDifficulty(1);
    handleAudioPlay();
  };

  const pauseGame = () => {
    setGameState('paused');
  };

  const resumeGame = () => {
    setGameState('playing');
  };

  const returnToMenu = () => {
    setGameState('menu');
    setEmojis([]);
    setSlicedWords([]);
    handleAudioPause();
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-700 to-gray-900 overflow-hidden relative">
      {/* HTML5 Audio Element */}
      <audio 
        id="game-audio" 
        onEnded={handleAudioEnded}
        preload="auto"
      >
        <source 
          src={musicTracks[currentTrack].url}
          type="audio/mpeg"
        />
      </audio>

      {/* Back button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-[60] bg-white/90 hover:bg-white shadow-lg rounded-full"
      >
        <ArrowLeft className="h-5 w-5 text-gray-800" />
      </Button>

      {/* Loading Screen */}
      {gameState === 'loading' && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center z-50"
          style={{
            backgroundImage: `url('https://raw.githubusercontent.com/Anyonebutsam/awsoon/main/src/assets/shpoko_loading.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute bottom-20 w-80">
            <div className="bg-white rounded-full h-8 overflow-hidden border-4 border-primary shadow-xl">
              <div 
                className="bg-gradient-to-r from-primary/80 to-primary h-full transition-all duration-100 ease-linear"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="text-center mt-4 text-primary font-black text-2xl font-nunito">
              Loading... {Math.round(loadingProgress)}%
            </div>
          </div>
        </div>
      )}

      {/* Menu Screen */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 z-50 pt-16">
          <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 border-b-8 border-primary">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-black mb-2 text-white uppercase font-nunito">
                SHPOKO
              </h1>
              <h2 className="text-3xl font-bold text-primary uppercase font-nunito">
                FRUIT SLICER
              </h2>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4 text-gray-300 uppercase tracking-wide text-sm font-nunito">SELECT TOPICS:</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(topics).map(topic => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`p-4 rounded-2xl uppercase font-bold text-base transition-all transform active:scale-95 border-b-4 font-nunito ${
                      selectedTopics.includes(topic)
                        ? 'bg-primary text-white border-primary-dark shadow-lg'
                        : 'bg-gray-700 text-gray-300 border-gray-800 hover:bg-gray-600'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              disabled={selectedTopics.length === 0}
              className={`w-full py-5 rounded-2xl font-black text-xl uppercase transition-all transform active:scale-95 border-b-4 font-nunito ${
                selectedTopics.length === 0
                  ? 'bg-gray-600 text-gray-500 border-gray-700 cursor-not-allowed'
                  : 'bg-primary text-white border-primary-dark hover:bg-primary/90 shadow-lg'
              }`}
            >
              START
            </button>
          </div>
        </div>
      )}

      {/* Paused Screen */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border-b-8 border-primary">
            <h2 className="text-4xl font-black text-center mb-8 text-gray-800 font-nunito">
              PAUSED
            </h2>
            <div className="space-y-4">
              <button
                onClick={resumeGame}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary/90 transition-all transform active:scale-95 border-b-4 border-primary-dark font-nunito"
              >
                RESUME
              </button>
              <button
                onClick={returnToMenu}
                className="w-full py-4 bg-destructive text-white rounded-2xl font-black text-lg hover:bg-destructive/90 transition-all transform active:scale-95 border-b-4 border-red-700 font-nunito"
              >
                QUIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Area */}
      <div className="w-full h-full relative">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://raw.githubusercontent.com/Anyonebutsam/awsoon/main/src/assets/shpoko_binhead.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'blur(4px) brightness(0.7)',
            zIndex: 0
          }}
        />
        <div 
          className="relative z-[1] w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {gameState === 'playing' && (
            <>
              {/* Score Display */}
              <div className="absolute top-4 left-16 bg-white px-5 py-3 rounded-2xl shadow-lg border-b-4 border-primary">
                <div className="text-primary font-black text-2xl font-nunito">
                  {score}
                </div>
                <div className="text-destructive font-bold text-sm uppercase font-nunito">
                  Misses: {misses}
                </div>
              </div>

              {/* Timer Display */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-8 py-4 rounded-2xl shadow-lg border-b-4 border-primary">
                <div className="text-gray-800 font-black text-3xl font-nunito">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>

              {/* Pause Button */}
              <button
                onClick={pauseGame}
                className="absolute top-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-5 py-3 rounded-2xl font-black transition-all transform active:scale-95 border-b-4 border-yellow-600 shadow-lg font-nunito"
              >
                ⏸ PAUSE
              </button>

              {/* Music Controls */}
              <div className="absolute top-20 right-4 bg-white p-3 rounded-2xl shadow-lg flex flex-col gap-3 border-b-4 border-primary">
                <div className="text-gray-800 text-xs text-center font-bold px-2 truncate max-w-[140px] font-nunito">
                  {musicTracks[currentTrack].title}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={previousTrack}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-all transform active:scale-90" 
                    title="Previous Track"
                  >
                    <SkipBack size={18} className="text-primary" />
                  </button>
                  <button
                    onClick={musicPlaying ? handleAudioPause : handleAudioPlay}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-all transform active:scale-90"
                    title={musicPlaying ? "Pause" : "Play"}
                  >
                    {musicPlaying ? <Pause size={18} className="text-primary" /> : <Play size={18} className="text-primary" />}
                  </button>
                  <button 
                    onClick={nextTrack}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-all transform active:scale-90" 
                    title="Next Track"
                  >
                    <SkipForward size={18} className="text-primary" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {volume > 0 ? <Volume2 size={18} className="text-primary" /> : <VolumeX size={18} className="text-primary" />}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-16 accent-primary"
                  />
                </div>
              </div>
            </>
          )}

          {/* Flying Emojis */}
          {emojis.map(emoji => (
            <div
              key={emoji.id}
              className="absolute text-6xl transition-none pointer-events-none"
              style={{
                left: `${emoji.x}%`,
                top: `${emoji.y}%`,
                transform: `translate(-50%, -50%) rotate(${emoji.rotation}deg)`
              }}
            >
              {emoji.emoji}
            </div>
          ))}

          {/* Sliced Word Popups */}
          {slicedWords.map(word => (
            <div
              key={word.id}
              className="absolute pointer-events-none"
              style={{
                left: `${word.x}%`,
                top: `${word.y}%`,
                transform: 'translate(-50%, -50%)',
                opacity: word.opacity
              }}
            >
              <div className="bg-white bg-opacity-95 px-6 py-3 rounded-2xl shadow-xl border-b-4 border-primary">
                <div className="text-3xl font-black text-primary font-nunito">
                  {word.word}
                </div>
                <div className="text-xl font-bold text-gray-600 font-nunito">
                  {word.meaning}
                </div>
              </div>
            </div>
          ))}

          {/* Slice Trail */}
          {slicePath.length > 1 && (
            <svg className="absolute inset-0 pointer-events-none w-full h-full">
              <polyline
                points={slicePath.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="rgba(255, 255, 0, 0.6)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShpokoFruitGame;
