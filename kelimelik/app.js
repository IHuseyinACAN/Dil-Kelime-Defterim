/**
 * Kelimelik - Core Application Engine v3.5 (Design Overhaul & Music)
 * Handles Themes, Word of the Day, Canvas Confetti, Study Ambient Synthesizer,
 * Dashboard, Habit Streak (Zinciri Kırma), Progress Chart, Study Launcher,
 * SRS Spaced Repetition, Inflection-Tolerant Fill-in-the-Blanks, Sorting,
 * Bulk Level Management, Flashcards, Quiz, Native TTS and 3.200 Words Database.
 */

const CURRENT_DB_VERSION = 'v3_3200';

// Application State
const AppState = {
  currentView: 'dashboard', // 'dashboard' or 'words'
  currentLanguage: 'en',
  currentTheme: 'theme-indigo',
  displayLimit: 60,
  sortBy: 'default',
  voiceRate: 0.9,
  languages: [
    { id: 'en', name: 'İngilizce', flag: '🇬🇧', ttsCode: 'en-US' },
    { id: 'de', name: 'Almanca (Yakında)', flag: '🇩🇪', ttsCode: 'de-DE', disabled: true },
    { id: 'es', name: 'İspanyolca (Yakında)', flag: '🇪🇸', ttsCode: 'es-ES', disabled: true }
  ],
  words: [],
  habit: {
    startDate: null,
    currentStreak: 1,
    bestStreak: 1,
    dailyGoal: 5,
    todayPracticed: 0,
    history: {}
  },
  filters: {
    search: '',
    status: 'all',
    level: 'all',
    onlyNotes: false
  },
  launcher: {
    mode: 'due',
    level: 'all',
    count: 5,
    method: 'flashcard'
  },
  study: {
    activeCards: [],
    currentIndex: 0,
    isFlipped: false
  },
  fillBlank: {
    activeQuestions: [],
    currentIndex: 0,
    currentWord: null,
    targetSentenceWord: '',
    hintGiven: false
  },
  quiz: {
    activeQuestions: [],
    currentIndex: 0,
    score: 0,
    total: 0,
    answered: false
  },
  editingWordId: null
};

// ============================================================
// STUDY & FOCUS AMBIENT MUSIC ENGINE (WEB AUDIO API SYNTHESIZER)
// 100% Offline, Zero Network Buffering, Soothing & Scientifically Calibrated
// ============================================================

const StudyMusic = {
  ctx: null,
  isPlaying: false,
  currentTrack: 'piano',
  volume: 0.4,
  gainNode: null,
  nodes: [],
  timer: null,

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  play() {
    this.init();
    if (!this.ctx) return;
    this.stop(); // Stop any running synth
    this.isPlaying = true;

    if (this.currentTrack === 'piano') {
      this.startPianoAmbient();
    } else if (this.currentTrack === 'rain') {
      this.startRainAmbient();
    } else if (this.currentTrack === 'alpha') {
      this.startAlphaWave();
    } else if (this.currentTrack === 'lofi') {
      this.startLofiCafe();
    }

    this.updateUI();
  },

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.nodes.forEach(n => {
      try {
        if (n.stop) n.stop();
        if (n.disconnect) n.disconnect();
      } catch (e) {}
    });
    this.nodes = [];
    this.updateUI();
  },

  setVolume(val) {
    this.volume = val / 100;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  },

  setTrack(trackName) {
    this.currentTrack = trackName;
    if (this.isPlaying) {
      this.play();
    }
  },

  // 1. Classical Soothing Piano (Chopin / Satie Ambient Chords)
  startPianoAmbient() {
    // Calming pentatonic frequencies
    const notes = [130.81, 164.81, 196.00, 220.00, 261.63, 329.63, 392.00, 440.00, 523.25]; // C, E, G, A, C, E, G, A
    const playChord = () => {
      if (!this.isPlaying || !this.ctx) return;
      const root = notes[Math.floor(Math.random() * (notes.length - 3))];
      const harmony = [root, root * 1.25, root * 1.5]; // Major chord triad

      harmony.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);

        noteGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.06, this.ctx.currentTime + 1.2 + idx * 0.2);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 5.5);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.gainNode);

        osc.start(this.ctx.currentTime + idx * 0.15);
        osc.stop(this.ctx.currentTime + 6.0);
      });
    };

    playChord();
    this.timer = setInterval(playChord, 3800);
  },

  // 2. Organic Pink Noise Rain Generator
  startRainAmbient() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate soothing pink noise
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    noiseNode.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.gainNode);

    noiseNode.start();
    this.nodes.push(noiseNode, filter, rainGain);
  },

  // 3. Binaural Alpha Wave (10Hz focus beat for memory retention)
  startAlphaWave() {
    const oscLeft = this.ctx.createOscillator();
    const oscRight = this.ctx.createOscillator();
    const merger = this.ctx.createChannelMerger(2);
    const waveGain = this.ctx.createGain();

    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(200, this.ctx.currentTime); // Left: 200 Hz

    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(210, this.ctx.currentTime); // Right: 210 Hz -> 10Hz Alpha beat!

    waveGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    oscLeft.connect(merger, 0, 0);
    oscRight.connect(merger, 0, 1);
    merger.connect(waveGain);
    waveGain.connect(this.gainNode);

    oscLeft.start();
    oscRight.start();
    this.nodes.push(oscLeft, oscRight, merger, waveGain);
  },

  // 4. Chill Lo-Fi Warm Drone
  startLofiCafe() {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const lofiGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime); // A2 warm drone

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    lofiGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(lofiGain);
    lofiGain.connect(this.gainNode);

    osc.start();
    this.nodes.push(osc, filter, lofiGain);
  },

  updateUI() {
    const headerBtn = document.getElementById('musicHeaderBtn');
    const headerWave = document.getElementById('headerWave');
    const playBtnIcon = document.getElementById('playBtnIcon');
    const playBtnText = document.getElementById('playBtnText');

    if (this.isPlaying) {
      if (headerBtn) headerBtn.classList.add('border-indigo-500', 'text-indigo-300');
      if (headerWave) headerWave.classList.remove('hidden');
      if (playBtnIcon) playBtnIcon.innerText = '⏸️';
      if (playBtnText) playBtnText.innerText = 'Durdur';
    } else {
      if (headerBtn) headerBtn.classList.remove('border-indigo-500', 'text-indigo-300');
      if (headerWave) headerWave.classList.add('hidden');
      if (playBtnIcon) playBtnIcon.innerText = '▶️';
      if (playBtnText) playBtnText.innerText = 'Çal';
    }
  }
};

function toggleStudyMusic() {
  if (StudyMusic.isPlaying) {
    StudyMusic.stop();
  } else {
    StudyMusic.play();
  }
}

function toggleMusicPlayerWidget() {
  const widget = document.getElementById('musicPlayerExpanded');
  if (widget) {
    widget.classList.toggle('hidden');
  }
}

function changeMusicTrack(track) {
  StudyMusic.setTrack(track);
}

function setMusicVolume(val) {
  StudyMusic.setVolume(val);
}

// ============================================================
// CANVAS CONFETTI CELEBRATION EFFECT (ZERO DEPENDENCY)
// ============================================================

function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#38bdf8', '#a855f7'];

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2 + (Math.random() - 0.5) * 100,
      r: Math.random() * 6 + 4,
      d: Math.random() * 70,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
      tiltAngle: 0,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() * -14) - 6
    });
  }

  let animationFrame;
  let duration = 120; // 2 seconds

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.lineWidth = p.r / 2;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + (p.r / 4), p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + (p.r / 4));
      ctx.stroke();

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.tiltAngle += p.tiltAngleIncremental;
      p.tilt = Math.sin(p.tiltAngle) * 15;
    });

    duration--;
    if (duration > 0) {
      animationFrame = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  draw();
}

// ============================================================
// THEMES & CUSTOMIZATION
// ============================================================

function setAppTheme(themeName) {
  AppState.currentTheme = themeName;
  document.body.className = `${themeName} text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white`;
  localStorage.setItem('kelimelik_theme', themeName);

  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) themeSelect.value = themeName;
}

function loadSavedTheme() {
  const saved = localStorage.getItem('kelimelik_theme') || 'theme-indigo';
  setAppTheme(saved);
}

// ============================================================
// WORD OF THE DAY (GÜNÜN KELİMESİ VİTRİNİ)
// ============================================================

function renderWordOfTheDay() {
  if (!AppState.words || AppState.words.length === 0) return;

  // Pick deterministic word based on day of year
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Pick an advanced/interesting word (prefer B2/C1/C2 with example)
  const advancedPool = AppState.words.filter(w => ['B2', 'C1', 'C2'].includes(w.primaryLevel) && w.meanings && w.meanings[0].exampleSentence);
  const pool = advancedPool.length > 0 ? advancedPool : AppState.words;
  const featured = pool[dayOfYear % pool.length];

  if (!featured) return;

  const termEl = document.getElementById('wodTerm');
  const phoneticEl = document.getElementById('wodPhonetic');
  const defEl = document.getElementById('wodDefinition');
  const sentenceEl = document.getElementById('wodSentence');
  const levelBadge = document.getElementById('wodLevelBadge');

  if (termEl) termEl.innerText = featured.term;
  if (phoneticEl) phoneticEl.innerText = featured.phonetic || '';
  if (defEl && featured.meanings[0]) defEl.innerText = featured.meanings[0].definition;
  if (sentenceEl && featured.meanings[0]) {
    sentenceEl.innerText = featured.meanings[0].exampleSentence ? `"${featured.meanings[0].exampleSentence}"` : '';
  }
  if (levelBadge) {
    levelBadge.innerText = featured.primaryLevel || 'B2';
    levelBadge.className = `px-2 py-0.5 rounded-full font-bold text-[11px] badge-${featured.primaryLevel || 'B2'}`;
  }
}

// Sound Effects via Web Audio API
const SoundEffects = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  },
  playTone(freq, type = 'sine', duration = 0.15) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  },
  correct() {
    this.playTone(523.25, 'sine', 0.1);
    setTimeout(() => this.playTone(659.25, 'sine', 0.15), 100);
  },
  wrong() {
    this.playTone(220, 'triangle', 0.2);
  },
  flip() {
    this.playTone(440, 'sine', 0.05);
  },
  goalReached() {
    this.playTone(523.25, 'sine', 0.1);
    setTimeout(() => this.playTone(659.25, 'sine', 0.1), 100);
    setTimeout(() => this.playTone(783.99, 'sine', 0.2), 200);
    launchConfetti();
  }
};

// ============================================================
// INITIALIZATION & VIEW MANAGEMENT
// ============================================================

function initApp() {
  loadSavedTheme();
  loadWordsFromStorage();
  loadHabitData();
  loadSettings();
  bindEvents();
  renderLanguages();
  switchView('dashboard');
  renderWordOfTheDay();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function switchView(viewName) {
  AppState.currentView = viewName;
  const viewDashboard = document.getElementById('viewDashboard');
  const viewWordList = document.getElementById('viewWordList');
  const navDashboardBtn = document.getElementById('navDashboardBtn');
  const navWordsBtn = document.getElementById('navWordsBtn');

  if (viewName === 'dashboard') {
    viewDashboard.classList.remove('hidden');
    viewWordList.classList.add('hidden');

    navDashboardBtn.className = "px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-indigo-600 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5";
    navWordsBtn.className = "px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-slate-400 hover:text-white flex items-center gap-1.5";

    renderDashboard();
    renderWordOfTheDay();
  } else {
    viewDashboard.classList.add('hidden');
    viewWordList.classList.remove('hidden');

    navDashboardBtn.className = "px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-slate-400 hover:text-white flex items-center gap-1.5";
    navWordsBtn.className = "px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-indigo-600 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5";

    AppState.displayLimit = 60;
    renderWordList();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// STORAGE & HABIT TRACKING (ZİNCİRİ KIRMA & GELİŞİM)
// ============================================================

function loadWordsFromStorage() {
  const saved = localStorage.getItem('kelimelik_words');
  const storedVersion = localStorage.getItem('kelimelik_db_version');

  if (saved && storedVersion === CURRENT_DB_VERSION) {
    try {
      AppState.words = JSON.parse(saved);
    } catch (e) {
      AppState.words = [...OXFORD_DATASET];
    }
  } else {
    if (saved) {
      try {
        const oldWords = JSON.parse(saved);
        const oldMap = new Map(oldWords.map(w => [w.term.toLowerCase(), w]));
        
        AppState.words = OXFORD_DATASET.map(newWord => {
          const old = oldMap.get(newWord.term.toLowerCase());
          if (old) {
            return {
              ...newWord,
              status: old.status || newWord.status,
              srs: old.srs || newWord.srs,
              userNotes: (old.userNotes && old.userNotes.length > 0) ? old.userNotes : newWord.userNotes
            };
          }
          return newWord;
        });

        oldWords.forEach(w => {
          if (!w.id.startsWith('ox_') && !AppState.words.some(x => x.term.toLowerCase() === w.term.toLowerCase())) {
            AppState.words.unshift(w);
          }
        });
      } catch (e) {
        AppState.words = [...OXFORD_DATASET];
      }
    } else {
      AppState.words = [...OXFORD_DATASET];
    }
    localStorage.setItem('kelimelik_db_version', CURRENT_DB_VERSION);
    saveWordsToStorage();
  }
}

function saveWordsToStorage() {
  localStorage.setItem('kelimelik_words', JSON.stringify(AppState.words));
}

function loadHabitData() {
  const today = getTodayDateString();
  const saved = localStorage.getItem('kelimelik_habit_v2');

  if (saved) {
    try {
      AppState.habit = JSON.parse(saved);
    } catch (e) {}
  }

  if (!AppState.habit.startDate) {
    AppState.habit.startDate = today;
  }
  if (!AppState.habit.history) {
    AppState.habit.history = {};
  }
  if (!AppState.habit.dailyGoal) {
    AppState.habit.dailyGoal = 5;
  }

  updateStreakCalculation();
  AppState.habit.todayPracticed = AppState.habit.history[today] || 0;
  saveHabitData();
}

function saveHabitData() {
  localStorage.setItem('kelimelik_habit_v2', JSON.stringify(AppState.habit));
  updateStreakUI();
}

function loadSettings() {
  const rate = localStorage.getItem('kelimelik_voice_rate');
  if (rate) AppState.voiceRate = parseFloat(rate);
}

function recordPracticeActivity(count = 1) {
  const today = getTodayDateString();
  const prevCount = AppState.habit.history[today] || 0;
  AppState.habit.history[today] = prevCount + count;
  AppState.habit.todayPracticed = AppState.habit.history[today];

  if (prevCount < AppState.habit.dailyGoal && AppState.habit.todayPracticed >= AppState.habit.dailyGoal) {
    SoundEffects.goalReached();
    showToast('🎉 Tebrikler! Bugünkü kelime hedefinizi tamamladınız!');
  }

  updateStreakCalculation();
  saveHabitData();
  renderDashboardStats();
}

function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function updateStreakCalculation() {
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const practiced = (AppState.habit.history && AppState.habit.history[dateStr]) || 0;

    if (practiced > 0 || (i === 0 && streak === 0)) {
      if (practiced > 0) streak++;
    } else {
      break;
    }
  }

  AppState.habit.currentStreak = Math.max(1, streak);
  if (streak > (AppState.habit.bestStreak || 1)) {
    AppState.habit.bestStreak = streak;
  }
}

function updateStreakUI() {
  const badge = document.getElementById('streakBadge');
  if (badge) {
    badge.innerHTML = `<span class="animate-pulse">🔥</span> <span>${AppState.habit.currentStreak} Günlük Seri</span>`;
  }
}

function resetToDefaultOxford() {
  if (confirm('3.200 kelimelik tam Oxford A1-C2 veritabanı sıfırlanıp geri yüklensin mi? Kendi eklediğiniz kelimeleri yedeklemeniz önerilir.')) {
    AppState.words = [...OXFORD_DATASET];
    saveWordsToStorage();
    if (AppState.currentView === 'dashboard') {
      renderDashboard();
    } else {
      renderWordList();
    }
    showToast('3.200 kelimelik Oxford paketi başarıyla yüklendi!');
  }
}

// ============================================================
// SETTINGS & BULK LEVEL MANAGEMENT
// ============================================================

function openSettingsModal() {
  const goalGroup = document.getElementById('goalOptionsGroup');
  if (goalGroup) {
    goalGroup.querySelectorAll('.selector-pill').forEach(btn => {
      if (parseInt(btn.innerText.trim(), 10) === AppState.habit.dailyGoal) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  }

  const rateGroup = document.getElementById('voiceRateGroup');
  if (rateGroup) {
    rateGroup.querySelectorAll('.selector-pill').forEach(btn => {
      const val = parseFloat(btn.innerText);
      if (Math.abs(val - AppState.voiceRate) < 0.05) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  }

  document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.add('hidden');
}

function setDailyGoal(goalCount) {
  AppState.habit.dailyGoal = goalCount;
  saveHabitData();
  renderDashboardStats();
  openSettingsModal();
  showToast(`Günlük hedef ${goalCount} kelime olarak ayarlandı.`);
}

function setVoiceRate(rate) {
  AppState.voiceRate = rate;
  localStorage.setItem('kelimelik_voice_rate', rate.toString());
  openSettingsModal();
  speakWord('Audio speed updated', 'en-US');
  showToast(`Ses hızı ${rate}x yapıldı.`);
}

function bulkMarkLevelMastered(level) {
  const targets = AppState.words.filter(w => w.primaryLevel === level && w.status !== 'mastered');
  if (targets.length === 0) {
    alert(`${level} seviyesindeki tüm kelimeler zaten 'Öğrenildi' durumunda!`);
    return;
  }

  if (confirm(`${level} seviyesindeki ${targets.length} kelimeyi topluca 'Öğrenildi' (Usta) olarak işaretlemek istiyor musunuz? Bu işlem zaman tasarrufu sağlar.`)) {
    targets.forEach(w => {
      w.status = 'mastered';
      if (!w.srs) w.srs = { stage: 5, nextReviewDate: new Date(Date.now() + 86400000 * 30).toISOString(), intervalDays: 30, repetitions: 5, streak: 5 };
      else w.srs.stage = 5;
      w.updatedAt = new Date().toISOString();
    });
    saveWordsToStorage();
    if (AppState.currentView === 'dashboard') renderDashboard();
    else renderWordList();
    closeSettingsModal();
    launchConfetti();
    showToast(`🟢 ${targets.length} adet ${level} kelimesi 'Öğrenildi' yapıldı!`);
  }
}

function bulkResetAllStatus() {
  if (confirm('Tüm kelimelerin durumunu sıfırlayıp "Öğrenilecek" (Yeni) yapmak istediğinize emin misiniz?')) {
    AppState.words.forEach(w => {
      w.status = 'to_learn';
      w.srs = { stage: 0, nextReviewDate: new Date().toISOString(), intervalDays: 0, repetitions: 0, streak: 0 };
      w.updatedAt = new Date().toISOString();
    });
    saveWordsToStorage();
    if (AppState.currentView === 'dashboard') renderDashboard();
    else renderWordList();
    closeSettingsModal();
    showToast('Tüm kelimeler sıfırlandı.');
  }
}

// ============================================================
// STUDY LAUNCHER MODAL (LEVEL & METHOD SELECTION)
// ============================================================

function openStudyLauncher(mode = 'due', defaultMethod = 'flashcard') {
  AppState.launcher.mode = mode;
  AppState.launcher.method = defaultMethod;

  selectLauncherLevel(AppState.launcher.level || 'all');
  selectLauncherCount(AppState.launcher.count || 5);
  selectLauncherMethod(defaultMethod);

  document.getElementById('studyLauncherModal').classList.remove('hidden');
}

function closeStudyLauncher() {
  document.getElementById('studyLauncherModal').classList.add('hidden');
}

function selectLauncherLevel(level) {
  AppState.launcher.level = level;
  const group = document.getElementById('launcherLevelGroup');
  if (group) {
    group.querySelectorAll('.selector-pill').forEach(btn => {
      if (btn.innerText.trim() === level || (level === 'all' && btn.innerText.trim() === 'Tümü')) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  }
}

function selectLauncherCount(count) {
  AppState.launcher.count = count;
  const group = document.getElementById('launcherCountGroup');
  if (group) {
    group.querySelectorAll('.selector-pill').forEach(btn => {
      if (btn.innerText.includes(count.toString())) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  }
}

function selectLauncherMethod(method) {
  AppState.launcher.method = method;
  const group = document.getElementById('launcherMethodGroup');
  if (group) {
    const buttons = group.querySelectorAll('.selector-pill');
    buttons.forEach(btn => btn.classList.remove('selected'));
    if (method === 'flashcard' && buttons[0]) buttons[0].classList.add('selected');
    if (method === 'fill_blank' && buttons[1]) buttons[1].classList.add('selected');
    if (method === 'quiz' && buttons[2]) buttons[2].classList.add('selected');
  }
}

function startConfiguredStudy() {
  closeStudyLauncher();
  const { mode, level, count, method } = AppState.launcher;

  if (method === 'flashcard') {
    startCustomFlashcards(mode, level, count);
  } else if (method === 'fill_blank') {
    startCustomFillBlank(mode, level, count);
  } else if (method === 'quiz') {
    startCustomQuiz(mode, level, count);
  }
}

// ============================================================
// DASHBOARD RENDERING: HABIT & CHARTS
// ============================================================

function renderDashboard() {
  renderDashboardStats();
  renderChainNodes();
  renderWeeklyChart();
  renderCefrDistributionPills();
}

function renderDashboardStats() {
  const currentLangWords = AppState.words.filter(w => w.language === AppState.currentLanguage);
  const total = currentLangWords.length;
  const toLearn = currentLangWords.filter(w => w.status === 'to_learn').length;
  const learning = currentLangWords.filter(w => w.status === 'learning').length;
  const mastered = currentLangWords.filter(w => w.status === 'mastered').length;

  const now = new Date();
  const due = currentLangWords.filter(w => {
    if (w.status === 'mastered') return false;
    if (!w.srs || !w.srs.nextReviewDate) return true;
    return new Date(w.srs.nextReviewDate) <= now;
  }).length;

  document.getElementById('dashTotalWords').innerText = total.toLocaleString();
  document.getElementById('dashMasteredWords').innerText = mastered.toLocaleString();
  document.getElementById('dashLearningWords').innerText = learning.toLocaleString();
  document.getElementById('dashDueWords').innerText = due.toLocaleString();

  const hubDueBadge = document.getElementById('hubDueBadge');
  if (hubDueBadge) {
    hubDueBadge.innerText = due > 0 ? `${due} kelime tekrar bekliyor` : 'Tüm tekrarlar yapıldı! 🎉';
    if (due === 0) {
      hubDueBadge.className = "mt-2.5 inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30";
    }
  }

  const hubToLearnBadge = document.getElementById('hubToLearnBadge');
  if (hubToLearnBadge) {
    hubToLearnBadge.innerText = `${toLearn.toLocaleString()} yeni kelime sırada`;
  }

  const start = new Date(AppState.habit.startDate || getTodayDateString());
  const today = new Date(getTodayDateString());
  const diffDays = Math.max(1, Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1);
  const chainDaysCount = document.getElementById('chainDaysCount');
  if (chainDaysCount) {
    chainDaysCount.innerText = `${diffDays} Gündür Devam Ediyorsun`;
  }

  const todayPracticed = AppState.habit.todayPracticed || 0;
  const goal = AppState.habit.dailyGoal || 5;
  const percent = Math.min(100, Math.round((todayPracticed / goal) * 100));

  const goalText = document.getElementById('dashGoalText');
  if (goalText) {
    goalText.innerText = `${todayPracticed} / ${goal} Tamamlandı (%${percent})`;
  }
  const goalBar = document.getElementById('dashGoalProgressBar');
  if (goalBar) {
    goalBar.style.width = `${percent}%`;
  }
}

function renderChainNodes() {
  const container = document.getElementById('chainNodesContainer');
  if (!container) return;

  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const today = new Date();
  const nodes = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = dayNames[d.getDay()];
    const count = (AppState.habit.history && AppState.habit.history[dateStr]) || 0;
    const isToday = i === 0;

    nodes.push({
      dateStr,
      dayName,
      count,
      isToday,
      active: count > 0
    });
  }

  container.innerHTML = nodes.map(node => `
    <div class="flex flex-col items-center gap-1.5">
      <div class="chain-node w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all
        ${node.active 
          ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 font-black active' 
          : 'bg-slate-900 border border-slate-800 text-slate-500'}
        ${node.isToday ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950' : ''}">
        ${node.active ? '🔥' : '○'}
      </div>
      <span class="text-[11px] font-semibold ${node.isToday ? 'text-indigo-400 font-bold' : 'text-slate-400'}">
        ${node.dayName}
      </span>
      <span class="text-[10px] text-slate-500 font-mono">
        ${node.count > 0 ? `${node.count} kel` : '-'}
      </span>
    </div>
  `).join('');
}

function renderWeeklyChart() {
  const chartEl = document.getElementById('weeklyActivityChart');
  if (!chartEl) return;

  const today = new Date();
  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const bars = [];
  let maxCount = AppState.habit.dailyGoal || 10;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = (AppState.habit.history && AppState.habit.history[dateStr]) || 0;
    if (count > maxCount) maxCount = count;
    bars.push({
      label: dayNames[d.getDay()],
      count: count,
      isToday: i === 0
    });
  }

  chartEl.innerHTML = bars.map(bar => {
    const heightPercent = Math.max(12, Math.round((bar.count / maxCount) * 100));
    const barColor = bar.isToday ? 'bg-indigo-500 shadow-md shadow-indigo-500/30' : bar.count > 0 ? 'bg-emerald-500/80' : 'bg-slate-800';
    return `
      <div class="flex-1 flex flex-col items-center justify-end h-full gap-1 group">
        <span class="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          ${bar.count}
        </span>
        <div class="w-full ${barColor} rounded-t-lg transition-all duration-500" style="height: ${heightPercent}%;"></div>
        <span class="text-[10px] text-slate-400 font-semibold mt-1 ${bar.isToday ? 'text-indigo-300 font-bold' : ''}">
          ${bar.label}
        </span>
      </div>
    `;
  }).join('');
}

function renderCefrDistributionPills() {
  const container = document.getElementById('cefrDistributionPills');
  if (!container) return;

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentLangWords = AppState.words.filter(w => w.language === AppState.currentLanguage);

  container.innerHTML = levels.map(lvl => {
    const count = currentLangWords.filter(w => w.primaryLevel === lvl || (w.meanings[0] && w.meanings[0].level === lvl)).length;
    return `
      <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold badge-${lvl}">
        ${lvl}: ${count.toLocaleString()}
      </span>
    `;
  }).join('');
}

// ============================================================
// SPEECH SYNTHESIS (WITH WAVE VISUALIZER)
// ============================================================

function speakWord(text, lang = 'en-US') {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = AppState.voiceRate || 0.9;

  const fcWave = document.getElementById('fcWave');
  utterance.onstart = () => {
    if (fcWave) fcWave.classList.remove('hidden');
  };
  utterance.onend = () => {
    if (fcWave) fcWave.classList.add('hidden');
  };
  utterance.onerror = () => {
    if (fcWave) fcWave.classList.add('hidden');
  };

  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online')));
  if (naturalVoice) utterance.voice = naturalVoice;

  window.speechSynthesis.speak(utterance);
}

// ============================================================
// PRACTICE MODE: CÜMLEDEKİ BOŞLUĞU DOLDURMA (INFLECTION TOLERANT)
// ============================================================

function startCustomFillBlank(mode, level, count) {
  const now = new Date();
  let pool = AppState.words.filter(w => w.language === AppState.currentLanguage);

  if (mode === 'due') {
    pool = pool.filter(w => {
      if (w.status === 'mastered') return false;
      if (!w.srs || !w.srs.nextReviewDate) return true;
      return new Date(w.srs.nextReviewDate) <= now;
    });
  } else if (mode === 'to_learn') {
    pool = pool.filter(w => w.status === 'to_learn');
  }

  if (level !== 'all') {
    pool = pool.filter(w => w.primaryLevel === level || (w.meanings[0] && w.meanings[0].level === level));
  }

  pool = pool.filter(w => w.meanings && w.meanings.some(m => m.exampleSentence && m.exampleSentence.trim().length > 5));

  if (pool.length === 0) {
    alert(`Seçtiğiniz filtrede (${level === 'all' ? 'Tüm Seviyeler' : level}) alıştırma yapılacak uygun kelime bulunamadı!`);
    return;
  }

  AppState.fillBlank.activeQuestions = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  AppState.fillBlank.currentIndex = 0;
  AppState.fillBlank.hintGiven = false;

  document.getElementById('fillBlankModal').classList.remove('hidden');
  renderCurrentFillBlankQuestion();
}

function closeFillBlankPractice() {
  document.getElementById('fillBlankModal').classList.add('hidden');
  if (AppState.currentView === 'dashboard') renderDashboard();
  else renderWordList();
}

function renderCurrentFillBlankQuestion() {
  const qWord = AppState.fillBlank.activeQuestions[AppState.fillBlank.currentIndex];
  if (!qWord) {
    closeFillBlankPractice();
    launchConfetti();
    showToast('🎉 Tebrikler! Cümle tamamlama serisini tamamladınız.');
    return;
  }

  AppState.fillBlank.currentWord = qWord;
  AppState.fillBlank.hintGiven = false;

  const total = AppState.fillBlank.activeQuestions.length;
  const currentNum = AppState.fillBlank.currentIndex + 1;
  document.getElementById('fbProgress').innerText = `${currentNum} / ${total}`;

  const meaningObj = qWord.meanings.find(m => m.exampleSentence) || qWord.meanings[0];
  const sentence = meaningObj.exampleSentence;
  const translation = meaningObj.exampleTranslation || '';
  const term = qWord.term;

  const wordsInSentence = sentence.split(/\s+/);
  let matchedWordInSentence = term;
  for (const raw of wordsInSentence) {
    const clean = raw.replace(/[.,!?;:"'()]/g, '');
    if (clean.toLowerCase().startsWith(term.toLowerCase().slice(0, 3))) {
      matchedWordInSentence = clean;
      break;
    }
  }
  AppState.fillBlank.targetSentenceWord = matchedWordInSentence;

  const regex = new RegExp(`\\b${matchedWordInSentence}\\b`, 'gi');
  let maskedSentence = sentence.replace(regex, '<span class="bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-lg border-b-2 border-indigo-500">___________</span>');
  if (!maskedSentence.includes('___________')) {
    const regex2 = new RegExp(`\\b${term}\\b`, 'gi');
    maskedSentence = sentence.replace(regex2, '<span class="bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-lg border-b-2 border-indigo-500">___________</span>');
  }

  document.getElementById('fbSentence').innerHTML = `"${maskedSentence}"`;
  document.getElementById('fbTranslation').innerText = translation ? `Türkçe: "${translation}"` : '';
  document.getElementById('fbMeaningHint').innerText = meaningObj.definition;

  const levelBadge = document.getElementById('fbLevelBadge');
  levelBadge.innerText = qWord.primaryLevel || 'A1';
  levelBadge.className = `px-2 py-0.5 rounded-full text-[11px] font-semibold badge-${qWord.primaryLevel || 'A1'}`;

  const inputEl = document.getElementById('fbInput');
  inputEl.value = '';
  inputEl.disabled = false;
  inputEl.focus();

  const feedback = document.getElementById('fbFeedback');
  feedback.classList.add('hidden');
}

function revealFirstLetterHint() {
  const qWord = AppState.fillBlank.currentWord;
  if (!qWord) return;
  const inputEl = document.getElementById('fbInput');
  if (!inputEl.value) {
    inputEl.value = qWord.term.charAt(0);
    inputEl.focus();
  }
}

function checkFillBlankAnswer() {
  const qWord = AppState.fillBlank.currentWord;
  if (!qWord) return;

  const inputEl = document.getElementById('fbInput');
  const userText = inputEl.value.trim().toLowerCase();
  const baseTarget = qWord.term.trim().toLowerCase();
  const sentenceTarget = (AppState.fillBlank.targetSentenceWord || '').trim().toLowerCase();

  const feedback = document.getElementById('fbFeedback');
  feedback.classList.remove('hidden');

  const isDirectMatch = userText === baseTarget || userText === sentenceTarget;
  const stem = baseTarget.endsWith('e') ? baseTarget.slice(0, -1) : baseTarget;
  const isInflectionMatch = userText.startsWith(stem) && Math.abs(userText.length - baseTarget.length) <= 3;

  if (isDirectMatch || isInflectionMatch) {
    SoundEffects.correct();
    feedback.className = "p-3.5 rounded-2xl text-xs font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 animate-fade-in";
    feedback.innerHTML = `✅ Harika! Doğru cevap: <strong>${qWord.term}</strong> ${sentenceTarget && sentenceTarget !== baseTarget ? `(Cümledeki hali: <em>${sentenceTarget}</em>)` : ''}`;
    speakWord(qWord.term);

    if (!qWord.srs) qWord.srs = { stage: 0, nextReviewDate: new Date().toISOString(), intervalDays: 1, repetitions: 0, streak: 0 };
    qWord.srs.stage = Math.min((qWord.srs.stage || 0) + 1, 5);
    qWord.srs.nextReviewDate = new Date(Date.now() + 86400000 * 3).toISOString();
    qWord.status = 'learning';
    saveWordsToStorage();

    recordPracticeActivity(1);

    inputEl.disabled = true;
    setTimeout(() => {
      AppState.fillBlank.currentIndex += 1;
      renderCurrentFillBlankQuestion();
    }, 1400);

  } else {
    SoundEffects.wrong();
    feedback.className = "p-3.5 rounded-2xl text-xs font-semibold bg-rose-500/20 border border-rose-500/40 text-rose-300 animate-fade-in";
    feedback.innerHTML = `❌ Tekrar deneyin! (İpucu: Doğru kelime <strong>${qWord.term}</strong>)`;
    inputEl.select();
  }
}

// ============================================================
// FLASHCARD ENGINE WITH LEVEL & COUNT CONFIG
// ============================================================

function startCustomFlashcards(mode, level, count) {
  const now = new Date();
  let pool = AppState.words.filter(w => w.language === AppState.currentLanguage);

  if (mode === 'due') {
    pool = pool.filter(w => {
      if (w.status === 'mastered') return false;
      if (!w.srs || !w.srs.nextReviewDate) return true;
      return new Date(w.srs.nextReviewDate) <= now;
    });
  } else if (mode === 'to_learn') {
    pool = pool.filter(w => w.status === 'to_learn');
  }

  if (level !== 'all') {
    pool = pool.filter(w => w.primaryLevel === level || (w.meanings[0] && w.meanings[0].level === level));
  }

  if (pool.length === 0) {
    alert(`Seçtiğiniz filtrede (${level === 'all' ? 'Tüm Seviyeler' : level}) çalışılacak kelime bulunamadı!`);
    return;
  }

  AppState.study.activeCards = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  AppState.study.currentIndex = 0;
  AppState.study.isFlipped = false;

  document.getElementById('flashcardModal').classList.remove('hidden');
  renderCurrentFlashcard();
}

function closeFlashcardStudy() {
  document.getElementById('flashcardModal').classList.add('hidden');
  if (AppState.currentView === 'dashboard') renderDashboard();
  else renderWordList();
}

function flipFlashcard() {
  SoundEffects.flip();
  AppState.study.isFlipped = !AppState.study.isFlipped;
  const cardInner = document.getElementById('flashcardInner');
  if (cardInner) {
    if (AppState.study.isFlipped) cardInner.classList.add('flipped');
    else cardInner.classList.remove('flipped');
  }
}

function renderCurrentFlashcard() {
  const current = AppState.study.activeCards[AppState.study.currentIndex];
  if (!current) {
    closeFlashcardStudy();
    launchConfetti();
    showToast('🎉 Tebrikler! Bugünkü kelime tekrarını tamamladınız.');
    return;
  }

  AppState.study.isFlipped = false;
  const cardInner = document.getElementById('flashcardInner');
  if (cardInner) cardInner.classList.remove('flipped');

  const total = AppState.study.activeCards.length;
  const currentNum = AppState.study.currentIndex + 1;
  document.getElementById('flashcardProgress').innerText = `${currentNum} / ${total}`;

  document.getElementById('fcFrontTerm').innerText = current.term;
  document.getElementById('fcFrontPhonetic').innerText = current.phonetic || '';
  const levelBadge = document.getElementById('fcFrontLevel');
  levelBadge.innerText = current.primaryLevel || 'A1';
  levelBadge.className = `px-2.5 py-0.5 rounded-full text-xs font-semibold badge-${current.primaryLevel || 'A1'}`;

  const backMeaningsContainer = document.getElementById('fcBackMeanings');
  backMeaningsContainer.innerHTML = current.meanings.map(m => `
    <div class="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 text-left">
      <div class="flex items-center gap-2">
        <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold">[${m.partOfSpeech || 'kelime'}]</span>
        <span class="text-base font-bold text-white">${m.definition}</span>
      </div>
      ${m.exampleSentence ? `
        <div class="mt-2 text-xs text-indigo-200 font-mono italic">"${m.exampleSentence}"</div>
        ${m.exampleTranslation ? `<div class="text-xs text-slate-400 mt-0.5">${m.exampleTranslation}</div>` : ''}
      ` : ''}
    </div>
  `).join('');

  const backNotesContainer = document.getElementById('fcBackNotes');
  if (current.userNotes && current.userNotes.length > 0) {
    backNotesContainer.innerHTML = `
      <div class="mt-2 p-2.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-left text-xs">
        <div class="text-sky-400 font-semibold mb-1">📝 Duyulan Cümleler:</div>
        <ul class="space-y-0.5 text-slate-300">
          ${current.userNotes.map(n => `<li>• ${n}</li>`).join('')}
        </ul>
      </div>
    `;
    backNotesContainer.classList.remove('hidden');
  } else {
    backNotesContainer.classList.add('hidden');
  }

  speakWord(current.term);
}

function rateFlashcard(rating) {
  const current = AppState.study.activeCards[AppState.study.currentIndex];
  if (!current) return;

  if (!current.srs) {
    current.srs = { stage: 0, nextReviewDate: new Date().toISOString(), intervalDays: 0, repetitions: 0, streak: 0 };
  }

  const srs = current.srs;
  const now = new Date();

  if (rating === 'hard') {
    srs.stage = 1;
    srs.intervalDays = 1;
    srs.streak = 0;
    current.status = 'learning';
    SoundEffects.wrong();
  } else if (rating === 'good') {
    srs.stage = Math.min((srs.stage || 0) + 1, 4);
    const intervals = [1, 2, 4, 7, 14];
    srs.intervalDays = intervals[srs.stage] || 3;
    srs.streak = (srs.streak || 0) + 1;
    current.status = 'learning';
    SoundEffects.correct();
  } else if (rating === 'easy') {
    srs.stage = Math.min((srs.stage || 0) + 2, 5);
    srs.intervalDays = srs.stage >= 5 ? 30 : 14;
    srs.streak = (srs.streak || 0) + 1;
    current.status = srs.stage >= 5 ? 'mastered' : 'learning';
    SoundEffects.correct();
  }

  const nextDate = new Date(now.getTime() + srs.intervalDays * 24 * 60 * 60 * 1000);
  srs.nextReviewDate = nextDate.toISOString();
  current.updatedAt = new Date().toISOString();

  saveWordsToStorage();
  recordPracticeActivity(1);

  AppState.study.currentIndex += 1;
  renderCurrentFlashcard();
}

// ============================================================
// QUIZ ENGINE WITH LEVEL & COUNT CONFIG
// ============================================================

function startCustomQuiz(mode, level, count) {
  let pool = AppState.words.filter(w => w.language === AppState.currentLanguage);

  if (level !== 'all') {
    pool = pool.filter(w => w.primaryLevel === level || (w.meanings[0] && w.meanings[0].level === level));
  }

  if (pool.length < 4) {
    alert('Quiz başlatabilmek için seçilen seviyede en az 4 kelime bulunmalıdır!');
    return;
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const questionsCount = Math.min(count, shuffled.length);
  const questions = [];

  for (let i = 0; i < questionsCount; i++) {
    const targetWord = shuffled[i];
    const correctMeaning = targetWord.meanings[0].definition;

    const otherWords = pool.filter(w => w.id !== targetWord.id);
    const randomDistractors = [...otherWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.meanings[0].definition);

    const options = [correctMeaning, ...randomDistractors].sort(() => Math.random() - 0.5);

    questions.push({
      word: targetWord,
      correctMeaning: correctMeaning,
      options: options
    });
  }

  AppState.quiz.activeQuestions = questions;
  AppState.quiz.currentIndex = 0;
  AppState.quiz.score = 0;
  AppState.quiz.total = questions.length;
  AppState.quiz.answered = false;

  document.getElementById('quizModal').classList.remove('hidden');
  renderCurrentQuizQuestion();
}

function closeQuizMode() {
  document.getElementById('quizModal').classList.add('hidden');
  if (AppState.currentView === 'dashboard') renderDashboard();
  else renderWordList();
}

function renderCurrentQuizQuestion() {
  const q = AppState.quiz.activeQuestions[AppState.quiz.currentIndex];
  if (!q) {
    showQuizResults();
    return;
  }

  AppState.quiz.answered = false;
  document.getElementById('quizProgress').innerText = `${AppState.quiz.currentIndex + 1} / ${AppState.quiz.total}`;
  document.getElementById('quizTerm').innerText = q.word.term;
  document.getElementById('quizPhonetic').innerText = q.word.phonetic || '';
  
  const levelBadge = document.getElementById('quizLevel');
  levelBadge.innerText = q.word.primaryLevel || 'A1';
  levelBadge.className = `px-2 py-0.5 rounded-full text-xs font-semibold badge-${q.word.primaryLevel || 'A1'}`;

  const exampleHint = document.getElementById('quizExampleHint');
  if (q.word.meanings[0] && q.word.meanings[0].exampleSentence) {
    exampleHint.innerText = `Örnek Cümle: "${q.word.meanings[0].exampleSentence}"`;
    exampleHint.classList.remove('hidden');
  } else {
    exampleHint.classList.add('hidden');
  }

  const optionsContainer = document.getElementById('quizOptionsContainer');
  optionsContainer.innerHTML = q.options.map((option, idx) => `
    <button onclick="answerQuizQuestion('${escapeHtml(option).replace(/'/g, "\\'")}', this)" 
      class="w-full text-left p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all font-medium text-slate-200 hover:text-white flex items-center justify-between text-sm sm:text-base">
      <span><strong class="text-indigo-400 mr-2">${String.fromCharCode(65 + idx)})</strong> ${option}</span>
      <span class="icon-indicator"></span>
    </button>
  `).join('');

  speakWord(q.word.term);
}

function answerQuizQuestion(selectedAnswer, buttonEl) {
  if (AppState.quiz.answered) return;
  AppState.quiz.answered = true;

  const q = AppState.quiz.activeQuestions[AppState.quiz.currentIndex];
  const isCorrect = selectedAnswer === q.correctMeaning;

  const buttons = document.querySelectorAll('#quizOptionsContainer button');
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.innerText.includes(q.correctMeaning)) {
      btn.classList.remove('bg-slate-800/80', 'border-slate-700');
      btn.classList.add('bg-emerald-600/30', 'border-emerald-500', 'text-emerald-200');
    }
  });

  if (isCorrect) {
    SoundEffects.correct();
    AppState.quiz.score += 1;
    buttonEl.classList.remove('bg-slate-800/80');
    buttonEl.classList.add('bg-emerald-600/40', 'border-emerald-500', 'text-emerald-200');
    recordPracticeActivity(1);
  } else {
    SoundEffects.wrong();
    buttonEl.classList.remove('bg-slate-800/80');
    buttonEl.classList.add('bg-rose-600/40', 'border-rose-500', 'text-rose-200');
  }

  setTimeout(() => {
    AppState.quiz.currentIndex += 1;
    renderCurrentQuizQuestion();
  }, 1200);
}

function showQuizResults() {
  const container = document.getElementById('quizQuestionWrapper');
  const percent = Math.round((AppState.quiz.score / AppState.quiz.total) * 100);

  if (percent >= 80) {
    launchConfetti();
  }

  container.innerHTML = `
    <div class="text-center py-8 animate-fade-in">
      <div class="text-6xl mb-4">${percent >= 80 ? '🏆' : percent >= 50 ? '👏' : '💪'}</div>
      <h3 class="text-2xl font-bold text-white mb-2">Quiz Tamamlandı!</h3>
      <p class="text-slate-300 text-lg mb-4">
        Toplam <strong class="text-white">${AppState.quiz.total}</strong> soruda 
        <strong class="text-emerald-400">${AppState.quiz.score} doğru</strong> yaptınız (%${percent}).
      </p>
      <div class="flex justify-center gap-3">
        <button onclick="startCustomQuiz(AppState.launcher.mode, AppState.launcher.level, AppState.launcher.count)" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-all shadow-md shadow-indigo-600/30">
          Tekrar Çöz
        </button>
        <button onclick="closeQuizMode()" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all">
          Kapat
        </button>
      </div>
    </div>
  `;
}

// ============================================================
// WORD LIST VIEW (DICTIONARY, SORTING, PAGINATION, FILTERS)
// ============================================================

function filterWords() {
  const currentLang = AppState.currentLanguage;
  const q = AppState.filters.search.toLowerCase().trim();
  const statusFilter = AppState.filters.status;
  const levelFilter = AppState.filters.level;
  const onlyNotes = AppState.filters.onlyNotes;
  const now = new Date();

  let result = AppState.words.filter(w => {
    if (w.language !== currentLang) return false;

    if (q) {
      const matchTerm = w.term.toLowerCase().includes(q);
      const matchMeanings = w.meanings.some(m => 
        (m.definition && m.definition.toLowerCase().includes(q)) ||
        (m.exampleSentence && m.exampleSentence.toLowerCase().includes(q)) ||
        (m.exampleTranslation && m.exampleTranslation.toLowerCase().includes(q))
      );
      const matchNotes = w.userNotes && w.userNotes.some(n => n.toLowerCase().includes(q));
      if (!matchTerm && !matchMeanings && !matchNotes) return false;
    }

    if (statusFilter === 'due') {
      if (w.status === 'mastered') return false;
      if (w.srs && w.srs.nextReviewDate && new Date(w.srs.nextReviewDate) > now) return false;
    } else if (statusFilter !== 'all' && w.status !== statusFilter) {
      return false;
    }

    if (levelFilter !== 'all') {
      const hasLevel = w.primaryLevel === levelFilter || w.meanings.some(m => m.level === levelFilter);
      if (!hasLevel) return false;
    }

    if (onlyNotes && (!w.userNotes || w.userNotes.length === 0)) {
      return false;
    }

    return true;
  });

  const levelOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };

  if (AppState.sortBy === 'az') {
    result.sort((a, b) => a.term.localeCompare(b.term));
  } else if (AppState.sortBy === 'za') {
    result.sort((a, b) => b.term.localeCompare(a.term));
  } else if (AppState.sortBy === 'level_asc') {
    result.sort((a, b) => (levelOrder[a.primaryLevel] || 3) - (levelOrder[b.primaryLevel] || 3));
  } else if (AppState.sortBy === 'level_desc') {
    result.sort((a, b) => (levelOrder[b.primaryLevel] || 3) - (levelOrder[a.primaryLevel] || 3));
  } else if (AppState.sortBy === 'srs') {
    result.sort((a, b) => {
      const aDate = (a.srs && a.srs.nextReviewDate) ? new Date(a.srs.nextReviewDate) : new Date(0);
      const bDate = (b.srs && b.srs.nextReviewDate) ? new Date(b.srs.nextReviewDate) : new Date(0);
      return aDate - bDate;
    });
  } else if (AppState.sortBy === 'newest') {
    result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  return result;
}

function loadMoreWords() {
  AppState.displayLimit += 60;
  renderWordList();
}

function renderWordList() {
  const container = document.getElementById('wordListContainer');
  const emptyState = document.getElementById('emptyState');
  const filtered = filterWords();

  const totalMatches = filtered.length;
  const displayed = filtered.slice(0, AppState.displayLimit);

  document.getElementById('resultCountBadge').innerText = `${displayed.length} / ${totalMatches.toLocaleString()} kelime gösteriliyor`;

  if (totalMatches === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  let cardsHtml = displayed.map(word => {
    const level = word.primaryLevel || (word.meanings[0] ? word.meanings[0].level : 'A1');
    const badgeClass = `badge-${level}`;

    const statusBadge = {
      to_learn: `<span class="px-2.5 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">🟡 Öğrenilecek</span>`,
      learning: `<span class="px-2.5 py-0.5 text-xs rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">🔵 Öğreniliyor</span>`,
      mastered: `<span class="px-2.5 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">🟢 Öğrenildi</span>`
    }[word.status] || '';

    const meaningsHtml = word.meanings.map((m, idx) => `
      <div class="py-2 border-b border-slate-800/80 last:border-none">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300">
              ${m.partOfSpeech || 'kelime'}
            </span>
            ${m.level ? `<span class="text-xs px-1.5 py-0.5 rounded-lg badge-${m.level}">${m.level}</span>` : ''}
            <span class="text-slate-100 font-medium">${m.definition}</span>
          </div>
        </div>

        ${m.exampleSentence ? `
          <div class="mt-2 pl-3 border-l-2 border-indigo-500/50 text-xs">
            <p class="text-indigo-200 font-mono italic">"${m.exampleSentence}"</p>
            ${m.exampleTranslation ? `<p class="text-slate-400 mt-0.5">${m.exampleTranslation}</p>` : ''}
            ${m.sourceNote ? `<p class="text-emerald-400/90 text-[11px] mt-0.5">💡 ${m.sourceNote}</p>` : ''}
          </div>
        ` : ''}
      </div>
    `).join('');

    const notesCount = (word.userNotes || []).length;
    const notesHtml = notesCount > 0 ? `
      <div class="mt-3 pt-2.5 border-t border-slate-800/80 bg-slate-900/50 p-2.5 rounded-xl">
        <div class="flex items-center justify-between text-xs text-sky-400 font-semibold mb-1.5">
          <span>📝 Sağdan Soldan Duyulan Cümleler (${notesCount})</span>
          <button onclick="quickAddNotePrompt('${word.id}')" class="text-[11px] text-slate-400 hover:text-white hover:underline">
            + Cümle Ekle
          </button>
        </div>
        <ul class="space-y-1">
          ${word.userNotes.map((note, nIdx) => `
            <li class="text-xs text-slate-300 flex items-start justify-between gap-2 group">
              <span class="leading-relaxed">• ${note}</span>
              <button onclick="deleteUserNote('${word.id}', ${nIdx})" title="Notu Sil" 
                class="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 text-[11px]">
                ✕
              </button>
            </li>
          `).join('')}
        </ul>
      </div>
    ` : `
      <div class="mt-2 text-right">
        <button onclick="quickAddNotePrompt('${word.id}')" class="text-[11px] text-slate-500 hover:text-sky-400 transition-colors">
          + Sağdan soldan duyduğun cümleyi not et
        </button>
      </div>
    `;

    return `
      <div class="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all shadow-lg hover:shadow-indigo-950/25 flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between gap-2 mb-3">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-xl font-bold text-white tracking-wide">${word.term}</h3>
              ${word.phonetic ? `<span class="text-xs text-slate-400 font-mono">${word.phonetic}</span>` : ''}
              <button onclick="speakWord('${word.term.replace(/'/g, "\\'")}', '${AppState.currentLanguage === 'en' ? 'en-US' : 'de-DE'}')" 
                title="Telaffuzu Dinle" 
                class="w-7 h-7 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white flex items-center justify-center transition-all">
                🔊
              </button>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}">${level}</span>
            </div>

            <div class="flex items-center gap-1.5">
              <div class="dropdown relative inline-block">
                <button onclick="toggleStatusDropdown('${word.id}')" class="flex items-center">
                  ${statusBadge}
                </button>
                <div id="statusMenu_${word.id}" class="hidden absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl z-20 py-1 text-xs">
                  <button onclick="setWordStatus('${word.id}', 'to_learn')" class="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-amber-300">🟡 Öğrenilecek</button>
                  <button onclick="setWordStatus('${word.id}', 'learning')" class="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-sky-300">🔵 Öğreniliyor</button>
                  <button onclick="setWordStatus('${word.id}', 'mastered')" class="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-emerald-300">🟢 Öğrenildi</button>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-1 mb-2">
            ${meaningsHtml}
          </div>

          ${notesHtml}
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div class="flex items-center gap-1 text-[11px] text-slate-500">
            <span>SRS: ${word.srs ? word.srs.stage || 0 : 0}/5</span>
            ${word.srs && word.srs.streak ? `<span>• Seri: ${word.srs.streak}</span>` : ''}
          </div>
          <div class="flex items-center gap-2">
            <button onclick="openEditModal('${word.id}')" class="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
              ✏️ Düzenle
            </button>
            <button onclick="deleteWord('${word.id}')" class="px-2 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors" title="Kelimeyi Sil">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (displayed.length < totalMatches) {
    cardsHtml += `
      <div class="col-span-full text-center py-6">
        <button onclick="loadMoreWords()" class="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 mx-auto">
          <span>⬇️ Daha Fazla Kelime Göster (+60)</span>
          <span class="text-xs text-indigo-200">(${totalMatches - displayed.length} kelime kaldı)</span>
        </button>
      </div>
    `;
  }

  container.innerHTML = cardsHtml;
}

function toggleStatusDropdown(wordId) {
  const menu = document.getElementById(`statusMenu_${wordId}`);
  if (menu) {
    const isHidden = menu.classList.contains('hidden');
    document.querySelectorAll('[id^="statusMenu_"]').forEach(el => el.classList.add('hidden'));
    if (isHidden) menu.classList.remove('hidden');
  }
}

function setWordStatus(wordId, newStatus) {
  const word = AppState.words.find(w => w.id === wordId);
  if (word) {
    word.status = newStatus;
    if (newStatus === 'mastered') {
      if (word.srs) word.srs.stage = 5;
    }
    word.updatedAt = new Date().toISOString();
    saveWordsToStorage();
    renderWordList();
  }
}

function deleteWord(wordId) {
  const word = AppState.words.find(w => w.id === wordId);
  if (!word) return;
  if (confirm(`'${word.term}' kelimesini silmek istediğinize emin misiniz?`)) {
    AppState.words = AppState.words.filter(w => w.id !== wordId);
    saveWordsToStorage();
    renderWordList();
    showToast(`'${word.term}' silindi.`);
  }
}

function quickAddNotePrompt(wordId) {
  const word = AppState.words.find(w => w.id === wordId);
  if (!word) return;

  const note = prompt(`'${word.term}' için sağdan soldan duyduğunuz yeni cümleyi veya özel notunuzu yazın:\n(Örn: Dizide '...' kalıbında duydum)`);
  if (note && note.trim()) {
    if (!word.userNotes) word.userNotes = [];
    word.userNotes.push(note.trim());
    word.updatedAt = new Date().toISOString();
    saveWordsToStorage();
    renderWordList();
    showToast('Duyulan cümle notlara kaydedildi!');
  }
}

function deleteUserNote(wordId, noteIndex) {
  const word = AppState.words.find(w => w.id === wordId);
  if (!word || !word.userNotes) return;
  word.userNotes.splice(noteIndex, 1);
  word.updatedAt = new Date().toISOString();
  saveWordsToStorage();
  renderWordList();
}

// ============================================================
// MODAL MANAGEMENT (ADD / EDIT WORD & DUPLICATION GUARD)
// ============================================================

let currentModalMeanings = [];
let currentModalNotes = [];

function checkDuplicateWord(inputTerm) {
  const cleanTerm = inputTerm.trim().toLowerCase();
  if (!cleanTerm) return null;

  return AppState.words.find(w => 
    w.language === AppState.currentLanguage && 
    w.term.toLowerCase() === cleanTerm &&
    w.id !== AppState.editingWordId
  );
}

function handleTermInputChange(e) {
  const term = e.target.value.trim();
  const alertContainer = document.getElementById('duplicateAlert');
  if (!alertContainer) return;

  const existing = checkDuplicateWord(term);

  if (existing) {
    const meaningsPreview = existing.meanings.map((m, idx) => 
      `<div class="text-xs text-slate-300 mt-1 pl-2 border-l-2 border-amber-500">
        <span class="font-semibold text-amber-400">${idx + 1}. [${m.partOfSpeech} - ${m.level || 'A1'}]:</span> ${m.definition}
       </div>`
    ).join('');

    const notesPreview = existing.userNotes && existing.userNotes.length > 0 
      ? `<div class="text-xs text-sky-300 mt-1">📝 ${existing.userNotes.length} adet duyulan cümle notu kayıtlı.</div>` 
      : '';

    alertContainer.innerHTML = `
      <div class="p-3.5 bg-amber-950/50 border border-amber-600/60 rounded-2xl animate-fade-in text-sm">
        <div class="flex items-center gap-2 text-amber-300 font-semibold">
          <span>⚠️ Bu kelime zaten listenizde kayıtlı!</span>
        </div>
        <p class="text-xs text-slate-300 mt-1">
          Kelimelerin birden fazla anlamı olabileceği için mevcut karta yeni bir anlam veya duyduğunuz cümleyi ekleyebilirsiniz.
        </p>
        <div class="my-2 bg-slate-900/60 p-2.5 rounded-xl">
          ${meaningsPreview}
          ${notesPreview}
        </div>
        <div class="flex gap-2 mt-2 flex-wrap">
          <button type="button" onclick="switchToAppendMeaning('${existing.id}')" 
            class="px-3 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm">
            ➕ Bu Karta Yeni Anlam Ekle
          </button>
          <button type="button" onclick="openEditModal('${existing.id}')" 
            class="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all">
            ✏️ Mevcut Kelimeyi Düzenle / Not Ekle
          </button>
        </div>
      </div>
    `;
    alertContainer.classList.remove('hidden');
  } else {
    alertContainer.innerHTML = '';
    alertContainer.classList.add('hidden');
  }
}

function switchToAppendMeaning(wordId) {
  openEditModal(wordId);
  setTimeout(() => {
    addModalMeaning();
  }, 150);
}

function openAddModal() {
  AppState.editingWordId = null;
  document.getElementById('modalTitle').innerText = '✨ Yeni Kelime Ekle';
  document.getElementById('wordTermInput').value = '';
  document.getElementById('wordTermInput').disabled = false;
  document.getElementById('wordPhoneticInput').value = '';
  document.getElementById('wordPrimaryLevel').value = 'A1';
  document.getElementById('wordStatusSelect').value = 'to_learn';

  const alertContainer = document.getElementById('duplicateAlert');
  if (alertContainer) {
    alertContainer.innerHTML = '';
    alertContainer.classList.add('hidden');
  }

  currentModalMeanings = [
    {
      id: 'm_' + Date.now(),
      partOfSpeech: 'verb',
      level: 'A1',
      definition: '',
      exampleSentence: '',
      exampleTranslation: '',
      sourceNote: ''
    }
  ];
  currentModalNotes = [];

  renderModalMeaningsList();
  renderModalNotesList();

  document.getElementById('wordModal').classList.remove('hidden');
  document.getElementById('wordTermInput').focus();
}

function openEditModal(wordId) {
  const word = AppState.words.find(w => w.id === wordId);
  if (!word) return;

  AppState.editingWordId = word.id;
  document.getElementById('modalTitle').innerText = `✏️ '${word.term}' Kelimesini Düzenle`;
  document.getElementById('wordTermInput').value = word.term;
  document.getElementById('wordPhoneticInput').value = word.phonetic || '';
  document.getElementById('wordPrimaryLevel').value = word.primaryLevel || 'A1';
  document.getElementById('wordStatusSelect').value = word.status || 'to_learn';

  const alertContainer = document.getElementById('duplicateAlert');
  if (alertContainer) {
    alertContainer.innerHTML = '';
    alertContainer.classList.add('hidden');
  }

  currentModalMeanings = JSON.parse(JSON.stringify(word.meanings || []));
  if (currentModalMeanings.length === 0) {
    currentModalMeanings.push({
      id: 'm_' + Date.now(),
      partOfSpeech: 'verb',
      level: 'A1',
      definition: '',
      exampleSentence: '',
      exampleTranslation: '',
      sourceNote: ''
    });
  }

  currentModalNotes = [...(word.userNotes || [])];

  renderModalMeaningsList();
  renderModalNotesList();

  document.getElementById('wordModal').classList.remove('hidden');
}

function closeWordModal() {
  document.getElementById('wordModal').classList.add('hidden');
  AppState.editingWordId = null;
}

function renderModalMeaningsList() {
  const container = document.getElementById('modalMeaningsContainer');
  if (!container) return;

  container.innerHTML = currentModalMeanings.map((m, idx) => `
    <div class="p-3.5 bg-slate-900/80 border border-slate-700/60 rounded-2xl relative space-y-2">
      <div class="flex items-center justify-between text-xs text-slate-300">
        <span class="font-bold text-indigo-400">Anlam #${idx + 1}</span>
        ${currentModalMeanings.length > 1 ? `
          <button type="button" onclick="removeModalMeaning(${idx})" class="text-rose-400 hover:text-rose-300">
            🗑️ Kaldır
          </button>
        ` : ''}
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div class="sm:col-span-2">
          <label class="block text-[11px] text-slate-400 mb-1">Türkçe Anlamı / Tanımı *</label>
          <input type="text" value="${escapeHtml(m.definition)}" oninput="updateMeaningField(${idx}, 'definition', this.value)"
            placeholder="örn: farkına varmak, idrak etmek" required
            class="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Kelime Türü</label>
          <select onchange="updateMeaningField(${idx}, 'partOfSpeech', this.value)"
            class="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500">
            <option value="verb" ${m.partOfSpeech === 'verb' ? 'selected' : ''}>Fiil (verb)</option>
            <option value="noun" ${m.partOfSpeech === 'noun' ? 'selected' : ''}>İsim (noun)</option>
            <option value="adjective" ${m.partOfSpeech === 'adjective' ? 'selected' : ''}>Sıfat (adj)</option>
            <option value="adverb" ${m.partOfSpeech === 'adverb' ? 'selected' : ''}>Zarf (adv)</option>
            <option value="phrase" ${m.partOfSpeech === 'phrase' ? 'selected' : ''}>Deyim / Phrasal</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Örnek Cümle (İngilizce)</label>
          <input type="text" value="${escapeHtml(m.exampleSentence || '')}" oninput="updateMeaningField(${idx}, 'exampleSentence', this.value)"
            placeholder="örn: I didn't realize how late it was."
            class="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono" />
        </div>
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Cümlenin Çevirisi</label>
          <input type="text" value="${escapeHtml(m.exampleTranslation || '')}" oninput="updateMeaningField(${idx}, 'exampleTranslation', this.value)"
            placeholder="örn: Vaktin ne kadar geç olduğunun farkına varmadım."
            class="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500" />
        </div>
      </div>

      <div>
        <label class="block text-[11px] text-slate-400 mb-1">Bağlam / İpucu Notu (Opsiyonel)</label>
        <input type="text" value="${escapeHtml(m.sourceNote || '')}" oninput="updateMeaningField(${idx}, 'sourceNote', this.value)"
          placeholder="örn: İş toplantısında sıkça kullanılır"
          class="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-emerald-300 focus:outline-none focus:border-indigo-500" />
      </div>
    </div>
  `).join('');
}

function updateMeaningField(idx, field, value) {
  if (currentModalMeanings[idx]) currentModalMeanings[idx][field] = value;
}

function addModalMeaning() {
  currentModalMeanings.push({
    id: 'm_' + Date.now(),
    partOfSpeech: 'verb',
    level: document.getElementById('wordPrimaryLevel').value || 'A1',
    definition: '',
    exampleSentence: '',
    exampleTranslation: '',
    sourceNote: ''
  });
  renderModalMeaningsList();
}

function removeModalMeaning(idx) {
  currentModalMeanings.splice(idx, 1);
  renderModalMeaningsList();
}

function renderModalNotesList() {
  const container = document.getElementById('modalNotesContainer');
  if (!container) return;

  container.innerHTML = currentModalNotes.map((note, idx) => `
    <div class="flex items-center justify-between gap-2 p-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
      <span class="text-slate-300 leading-normal">• ${note}</span>
      <button type="button" onclick="removeModalNote(${idx})" class="text-rose-400 hover:text-rose-300">✕</button>
    </div>
  `).join('');
}

function addModalNote() {
  const input = document.getElementById('newHeardSentenceInput');
  const note = input.value.trim();
  if (note) {
    currentModalNotes.push(note);
    input.value = '';
    renderModalNotesList();
  }
}

function removeModalNote(idx) {
  currentModalNotes.splice(idx, 1);
  renderModalNotesList();
}

function handleWordFormSubmit(e) {
  e.preventDefault();

  const term = document.getElementById('wordTermInput').value.trim();
  const phonetic = document.getElementById('wordPhoneticInput').value.trim();
  const primaryLevel = document.getElementById('wordPrimaryLevel').value;
  const status = document.getElementById('wordStatusSelect').value;

  if (!term) {
    alert('Lütfen kelimeyi giriniz.');
    return;
  }

  const validMeanings = currentModalMeanings.filter(m => m.definition && m.definition.trim());
  if (validMeanings.length === 0) {
    alert('Lütfen en az bir Türkçe anlam tanımı giriniz.');
    return;
  }

  const duplicate = checkDuplicateWord(term);
  if (!AppState.editingWordId && duplicate) {
    if (!confirm(`'${term}' kelimesi zaten listenizde var! Yine de yeni bir kayıt olarak eklemek istiyor musunuz?`)) {
      return;
    }
  }

  if (AppState.editingWordId) {
    const word = AppState.words.find(w => w.id === AppState.editingWordId);
    if (word) {
      word.term = term;
      word.phonetic = phonetic;
      word.primaryLevel = primaryLevel;
      word.status = status;
      word.meanings = validMeanings;
      word.userNotes = currentModalNotes;
      word.updatedAt = new Date().toISOString();
      showToast(`'${term}' güncellendi.`);
    }
  } else {
    const newWord = {
      id: 'w_' + Date.now(),
      language: AppState.currentLanguage,
      term: term,
      phonetic: phonetic,
      primaryLevel: primaryLevel,
      status: status,
      meanings: validMeanings,
      userNotes: currentModalNotes,
      srs: {
        stage: status === 'mastered' ? 5 : 0,
        nextReviewDate: new Date().toISOString(),
        intervalDays: 0,
        repetitions: 0,
        streak: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    AppState.words.unshift(newWord);
    showToast(`'${term}' kelimeliğe eklendi! ✨`);
  }

  saveWordsToStorage();
  closeWordModal();

  if (AppState.currentView === 'dashboard') {
    renderDashboard();
    renderWordOfTheDay();
  } else {
    renderWordList();
  }
}

// ============================================================
// EXPORT / IMPORT (BACKUP & RESTORE)
// ============================================================

function exportDataAsJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(AppState.words, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `kelimelik_yedek_${getTodayDateString()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Kelimelik yedeği başarıyla indirildi.');
}

function importDataFromJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        if (confirm(`${imported.length} adet kelime içe aktarılacak. Mevcut listenize eklensin mi?`)) {
          const existingIds = new Set(AppState.words.map(w => w.id));
          imported.forEach(item => {
            if (!existingIds.has(item.id)) AppState.words.push(item);
          });
          saveWordsToStorage();
          if (AppState.currentView === 'dashboard') renderDashboard();
          else renderWordList();
          showToast(`${imported.length} kelime başarıyla eklendi!`);
        }
      } else {
        alert('Geçersiz dosya formatı.');
      }
    } catch (err) {
      alert('Dosya okunurken hata oluştu: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ============================================================
// LANGUAGES
// ============================================================

function renderLanguages() {
  const select = document.getElementById('langSelect');
  if (!select) return;
  select.innerHTML = AppState.languages.map(l => `
    <option value="${l.id}" ${l.id === AppState.currentLanguage ? 'selected' : ''} ${l.disabled ? 'disabled' : ''}>
      ${l.flag} ${l.name}
    </option>
  `).join('');
}

function switchLanguage(langId) {
  AppState.currentLanguage = langId;
  AppState.displayLimit = 60;
  if (AppState.currentView === 'dashboard') {
    renderDashboard();
    renderWordOfTheDay();
  } else {
    renderWordList();
  }
  showToast(`Dil seçildi: ${langId.toUpperCase()}`);
}

// ============================================================
// UTILITIES & EVENT LISTENERS
// ============================================================

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = message;
  toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
  }, 2500);
}

function bindEvents() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.filters.search = e.target.value;
      AppState.displayLimit = 60;
      renderWordList();
    });
  }

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      AppState.sortBy = e.target.value;
      AppState.displayLimit = 60;
      renderWordList();
    });
  }

  document.querySelectorAll('[data-status-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-status-filter]').forEach(b => b.classList.remove('active-filter'));
      e.currentTarget.classList.add('active-filter');
      AppState.filters.status = e.currentTarget.getAttribute('data-status-filter');
      AppState.displayLimit = 60;
      renderWordList();
    });
  });

  const levelSelect = document.getElementById('levelFilterSelect');
  if (levelSelect) {
    levelSelect.addEventListener('change', (e) => {
      AppState.filters.level = e.target.value;
      AppState.displayLimit = 60;
      renderWordList();
    });
  }

  const notesCheckbox = document.getElementById('onlyNotesCheckbox');
  if (notesCheckbox) {
    notesCheckbox.addEventListener('change', (e) => {
      AppState.filters.onlyNotes = e.target.checked;
      AppState.displayLimit = 60;
      renderWordList();
    });
  }

  const wordTermInput = document.getElementById('wordTermInput');
  if (wordTermInput) {
    wordTermInput.addEventListener('input', handleTermInputChange);
  }

  const fbInput = document.getElementById('fbInput');
  if (fbInput) {
    fbInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        checkFillBlankAnswer();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    const flashcardModal = document.getElementById('flashcardModal');
    const isFlashcardOpen = flashcardModal && !flashcardModal.classList.contains('hidden');

    if (e.key === 'Escape') {
      closeWordModal();
      closeFlashcardStudy();
      closeQuizMode();
      closeFillBlankPractice();
      closeStudyLauncher();
      closeSettingsModal();
      return;
    }

    if (isFlashcardOpen) {
      if (e.code === 'Space') {
        e.preventDefault();
        flipFlashcard();
      } else if (e.key === '1') {
        rateFlashcard('hard');
      } else if (e.key === '2') {
        rateFlashcard('good');
      } else if (e.key === '3') {
        rateFlashcard('easy');
      } else if (e.key === 's' || e.key === 'S') {
        const cur = AppState.study.activeCards[AppState.study.currentIndex];
        if (cur) speakWord(cur.term);
      }
    }
  });

  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => switchLanguage(e.target.value));
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', initApp);
