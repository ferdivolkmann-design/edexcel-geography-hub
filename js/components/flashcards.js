/**
 * Flashcard Recall Trainer Component
 * Interactive flashcard study mode with 3D flip animation and real-time confidence rating.
 */
import { StorageService } from '../services/storage.js';

export class FlashcardsModal {
  constructor(options = {}) {
    this.onConfidenceChanged = options.onConfidenceChanged || (() => {});
    this.caseStudies = [];
    this.currentIndex = 0;
    this.isFlipped = false;
  }

  open(caseStudies, startIndex = 0) {
    this.caseStudies = [...caseStudies];
    this.currentIndex = Math.max(0, Math.min(startIndex, this.caseStudies.length - 1));
    this.isFlipped = false;
    this.render();
  }

  close() {
    const container = document.getElementById('flashcard-modal-container');
    if (container) container.innerHTML = '';
  }

  flip() {
    this.isFlipped = !this.isFlipped;
    const cardEl = document.getElementById('flashcard-inner');
    if (cardEl) {
      if (this.isFlipped) {
        cardEl.classList.add('rotate-y-180');
      } else {
        cardEl.classList.remove('rotate-y-180');
      }
    }
  }

  next() {
    if (this.caseStudies.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.caseStudies.length;
    this.isFlipped = false;
    this.render();
  }

  prev() {
    if (this.caseStudies.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.caseStudies.length) % this.caseStudies.length;
    this.isFlipped = false;
    this.render();
  }

  shuffle() {
    for (let i = this.caseStudies.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.caseStudies[i], this.caseStudies[j]] = [this.caseStudies[j], this.caseStudies[i]];
    }
    this.currentIndex = 0;
    this.isFlipped = false;
    this.render();
  }

  setRating(rating) {
    const study = this.caseStudies[this.currentIndex];
    if (!study) return;
    StorageService.setConfidenceRating(study.id, rating);
    this.onConfidenceChanged(study.id, rating);
    // Smoothly advance to next card
    setTimeout(() => this.next(), 300);
  }

  render() {
    const container = document.getElementById('flashcard-modal-container');
    if (!container) return;

    if (this.caseStudies.length === 0) {
      container.innerHTML = `
        <div class="fixed inset-0 z-[100000] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl p-6 text-center max-w-sm">
            <p class="text-sm font-bold text-slate-800">No case studies available to practice.</p>
            <button id="fc-close-empty" class="mt-4 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl">Close</button>
          </div>
        </div>
      `;
      container.querySelector('#fc-close-empty').onclick = () => this.close();
      return;
    }

    const study = this.caseStudies[this.currentIndex];
    const isPhysical = study.category === 'Physical';
    const ratings = StorageService.getConfidenceRatings();
    const curRating = ratings[study.id] || 'needs-work';

    const ratingBadge = {
      'mastered': '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">🟢 Mastered</span>',
      'reviewing': '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">🟡 Reviewing</span>',
      'needs-work': '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">🔴 Needs Work</span>'
    }[curRating] || '';

    container.innerHTML = `
      <div class="fixed inset-0 z-[100000] overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
        <div class="w-full max-w-2xl flex flex-col items-center">
          
          <!-- Top Control Header -->
          <div class="w-full flex items-center justify-between text-white mb-3 px-2">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-indigo-200">🗂️ Active Recall Flashcards</span>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-slate-300">
                ${this.currentIndex + 1} of ${this.caseStudies.length}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button id="fc-shuffle-btn" title="Shuffle Deck" class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              </button>
              <button id="fc-close-btn" class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <!-- 3D Card Container -->
          <div class="w-full perspective-1000">
            <div id="flashcard-card" class="w-full min-h-[380px] sm:min-h-[420px] bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-indigo-500/10 hover:border-indigo-300 relative select-none">
              
              <!-- Front or Back Content -->
              <div id="flashcard-body" class="flex-1 flex flex-col">
                
                <!-- Card Header Tags -->
                <div class="flex items-center justify-between gap-2 mb-4">
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      isPhysical ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                    }">${study.category} Geography</span>
                    <span class="text-xs text-slate-500 font-semibold truncate max-w-[200px]">${study.topic}</span>
                  </div>
                  <div>${ratingBadge}</div>
                </div>

                ${!this.isFlipped ? `
                  <!-- FRONT OF CARD -->
                  <div class="flex-1 flex flex-col items-center justify-center text-center my-6 space-y-4">
                    <span class="text-3xl sm:text-4xl">🌍</span>
                    <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight max-w-md">
                      ${study.title}
                    </h3>
                    <p class="text-xs text-slate-500 font-medium">📍 ${study.country}</p>
                    <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 max-w-md text-xs text-slate-700 leading-relaxed font-medium">
                      🧠 <strong>Active Recall Prompt:</strong> What are the hard place-specific numbers, dates, damages, and the primary AO2 evaluation arguments?
                    </div>
                  </div>
                ` : `
                  <!-- BACK OF CARD (REVEALED) -->
                  <div class="flex-1 overflow-y-auto space-y-3.5 my-2 pr-1 animate-fadeIn">
                    <h4 class="font-bold text-sm text-slate-900 border-b border-slate-100 pb-1">
                      ${study.title}
                    </h4>

                    <!-- AO1 Place-Specific Stats -->
                    <div>
                      <span class="text-[11px] font-extrabold uppercase tracking-wide text-sky-800 block mb-1">
                        📊 Hard Place-Specific Stats (AO1):
                      </span>
                      <ul class="space-y-1 text-xs text-slate-700">
                        ${study.stats.slice(0, 3).map(stat => `<li class="flex items-start gap-1.5"><span class="text-indigo-500 font-bold">•</span><span>${stat}</span></li>`).join('')}
                      </ul>
                    </div>

                    <!-- AO2 Strengths vs Limitations -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div class="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
                        <span class="text-[10px] font-bold text-emerald-800 uppercase block mb-0.5">✅ Success / Strength:</span>
                        <p class="text-[11px] text-slate-800 leading-relaxed">${study.evaluation.strengths[0] || 'High management success'}</p>
                      </div>
                      <div class="p-2 rounded-lg bg-rose-50/60 border border-rose-200">
                        <span class="text-[10px] font-bold text-rose-800 uppercase block mb-0.5">❌ Limitation / Failure:</span>
                        <p class="text-[11px] text-slate-800 leading-relaxed">${study.evaluation.limitations[0] || 'Unintended externalities'}</p>
                      </div>
                    </div>

                    <!-- Top Tip -->
                    ${study.examTips ? `
                      <div class="p-2 rounded-lg bg-indigo-50/60 border border-indigo-200 text-[11px] text-indigo-950 font-medium">
                        💡 <strong>Top Tip:</strong> ${study.examTips}
                      </div>
                    ` : ''}
                  </div>
                `}

              </div>

              <!-- Flip Card Hint -->
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span class="flex items-center gap-1 font-semibold text-indigo-600">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                  <span>Click card to ${this.isFlipped ? 'hide answer' : 'reveal answer'}</span>
                </span>
                <span class="text-[11px] text-slate-400 font-mono">Use ← / → keys</span>
              </div>

            </div>
          </div>

          <!-- Bottom Actions Bar: Self Rating & Next/Previous -->
          <div class="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            <!-- Previous Button -->
            <button id="fc-prev-btn" class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
              <span>Previous</span>
            </button>

            <!-- Self-Assessment Buttons (Traffic Light) -->
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-300 font-semibold hidden sm:inline mr-1">Rate Recall:</span>
              <button id="fc-rate-red" class="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs transition shadow-sm cursor-pointer flex items-center gap-1">
                <span>🔴</span>
                <span>Needs Work</span>
              </button>
              <button id="fc-rate-yellow" class="px-3 py-1.5 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-white font-bold text-xs transition shadow-sm cursor-pointer flex items-center gap-1">
                <span>🟡</span>
                <span>Reviewing</span>
              </button>
              <button id="fc-rate-green" class="px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-sm cursor-pointer flex items-center gap-1">
                <span>🟢</span>
                <span>Mastered</span>
              </button>
            </div>

            <!-- Next Button -->
            <button id="fc-next-btn" class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-md cursor-pointer">
              <span>Next Card</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>

          </div>

        </div>
      </div>
    `;

    // Hook events
    container.querySelector('#fc-close-btn').onclick = () => this.close();
    container.querySelector('#fc-shuffle-btn').onclick = () => this.shuffle();
    container.querySelector('#flashcard-card').onclick = () => this.flip();

    container.querySelector('#fc-prev-btn').onclick = () => this.prev();
    container.querySelector('#fc-next-btn').onclick = () => this.next();

    container.querySelector('#fc-rate-red').onclick = (e) => { e.stopPropagation(); this.setRating('needs-work'); };
    container.querySelector('#fc-rate-yellow').onclick = (e) => { e.stopPropagation(); this.setRating('reviewing'); };
    container.querySelector('#fc-rate-green').onclick = (e) => { e.stopPropagation(); this.setRating('mastered'); };

    // Keyboard navigation (Esc, Space to flip, Arrows)
    const keyHandler = (e) => {
      if (e.key === 'Escape') {
        this.close();
        window.removeEventListener('keydown', keyHandler);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.flip();
      } else if (e.key === 'ArrowRight') {
        this.next();
      } else if (e.key === 'ArrowLeft') {
        this.prev();
      }
    };
    window.addEventListener('keydown', keyHandler);
  }
}
