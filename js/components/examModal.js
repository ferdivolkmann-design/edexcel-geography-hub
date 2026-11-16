/**
 * Exam Question Practice Modal Component
 * Generates authentic Pearson Edexcel 12-mark & 20-mark questions with interactive countdown timer,
 * AO1 & AO2 examiner rubrics, and real-time essay scratchpad.
 */
import { SAMPLE_EXAM_QUESTIONS, EDEXCEL_PAPERS } from '../data/initialData.js';
import { StorageService } from '../services/storage.js';

export class ExamModal {
  constructor(options = {}) {
    this.onSaveNote = options.onSaveNote || (() => {});
    this.currentStudy = null;
    this.currentQuestion = null;
    this.selectedMarks = 20; // 12 or 20
    this.timerInterval = null;
    this.timerSeconds = 35 * 60; // 35 min default for 20m
    this.isTimerRunning = false;
  }

  open(study) {
    this.currentStudy = study;
    this.selectedMarks = 20;
    this.isTimerRunning = false;
    clearInterval(this.timerInterval);
    this.selectQuestionForStudy();
    this.render();
  }

  close() {
    clearInterval(this.timerInterval);
    this.isTimerRunning = false;
    const container = document.getElementById('exam-practice-modal-container');
    if (container) container.innerHTML = '';
  }

  selectQuestionForStudy() {
    if (!this.currentStudy) return;
    const topic = this.currentStudy.topic;
    const questions = SAMPLE_EXAM_QUESTIONS[topic] || [];
    const matched = questions.find(q => q.marks === this.selectedMarks) || questions[0];

    if (matched) {
      this.currentQuestion = matched;
      this.timerSeconds = matched.timeMinutes * 60;
    } else {
      // Dynamic fallback for custom study
      const is20 = this.selectedMarks === 20;
      this.currentQuestion = {
        marks: this.selectedMarks,
        command: is20 ? 'Evaluate' : 'Assess',
        question: is20 
          ? `Evaluate the extent to which management strategies have successfully mitigated social, economic, and environmental risks in ${this.currentStudy.title}. (20 marks)`
          : `Assess the relative importance of physical processes compared to human governance in ${this.currentStudy.title}. (12 marks)`,
        timeMinutes: is20 ? 35 : 18,
        ao1Key: `Include place-specific statistics: ${this.currentStudy.stats?.slice(0, 2).join('; ') || 'Dates, casualties, costs'}.`,
        ao2Key: `Contrast successes/strengths against limitations/failures; evaluate short vs long-term sustainability.`
      };
      this.timerSeconds = (is20 ? 35 : 18) * 60;
    }
  }

  setMarks(marks) {
    this.selectedMarks = marks;
    clearInterval(this.timerInterval);
    this.isTimerRunning = false;
    this.selectQuestionForStudy();
    this.render();
  }

  toggleTimer() {
    if (this.isTimerRunning) {
      clearInterval(this.timerInterval);
      this.isTimerRunning = false;
    } else {
      this.isTimerRunning = true;
      this.timerInterval = setInterval(() => {
        if (this.timerSeconds > 0) {
          this.timerSeconds--;
          this.updateTimerDisplay();
        } else {
          clearInterval(this.timerInterval);
          this.isTimerRunning = false;
          alert('⏱️ Time is up! Review your essay plan and check against the AO rubric.');
          this.updateTimerDisplay();
        }
      }, 1000);
    }
    this.updateTimerControls();
  }

  resetTimer() {
    clearInterval(this.timerInterval);
    this.isTimerRunning = false;
    this.timerSeconds = (this.currentQuestion?.timeMinutes || 35) * 60;
    this.updateTimerDisplay();
    this.updateTimerControls();
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  updateTimerDisplay() {
    const el = document.getElementById('exam-timer-display');
    if (el) {
      el.textContent = this.formatTime(this.timerSeconds);
      if (this.timerSeconds <= 300 && this.timerSeconds > 0) {
        el.className = 'font-mono text-2xl font-black text-rose-600 animate-pulse';
      } else {
        el.className = 'font-mono text-2xl font-black text-slate-800';
      }
    }
  }

  updateTimerControls() {
    const btn = document.getElementById('exam-timer-toggle-btn');
    if (btn) {
      btn.innerHTML = this.isTimerRunning 
        ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>Pause</span>`
        : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>Start Timer</span>`;
      btn.className = this.isTimerRunning
        ? 'px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm'
        : 'px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm';
    }
  }

  render() {
    const container = document.getElementById('exam-practice-modal-container');
    if (!container || !this.currentStudy) return;

    const q = this.currentQuestion;
    const is20 = this.selectedMarks === 20;
    const paperName = EDEXCEL_PAPERS['Paper 1'].includes(this.currentStudy.topic) ? 'Paper 1 (Physical)' : 'Paper 2 (Human)';
    
    // Get stored student note for this case study
    const notesMap = StorageService.getStudentNotes();
    const existingPlan = notesMap[this.currentStudy.id] || '';

    container.innerHTML = `
      <div class="fixed inset-0 z-[100000] overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
          
          <!-- Modal Header -->
          <div class="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-800">
                  Edexcel 9GE0 Exam Practice
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                  ${paperName}
                </span>
              </div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                Essay Practice: ${this.currentStudy.title}
              </h2>
            </div>

            <button id="exam-modal-close-btn" class="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm">
            
            <!-- Question Selector & Timer Bar -->
            <div class="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-4 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
              
              <!-- Marks Switcher Tabs -->
              <div class="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl backdrop-blur-xs">
                <button id="exam-tab-12" data-mark-btn="12" class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  !is20 ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }">
                  12-Mark Essay
                </button>
                <button id="exam-tab-20" data-mark-btn="20" class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  is20 ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }">
                  20-Mark Essay
                </button>
              </div>

              <!-- Interactive Countdown Timer -->
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <span class="text-[10px] text-slate-300 font-medium block">Allocated Time</span>
                  <span id="exam-timer-display" class="font-mono text-2xl font-black text-amber-300">
                    ${this.formatTime(this.timerSeconds)}
                  </span>
                </div>

                <div class="flex items-center gap-1.5">
                  <button id="exam-timer-toggle-btn" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span>Start Timer</span>
                  </button>
                  <button id="exam-timer-reset-btn" title="Reset Timer" class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Exam Question Prompts Box -->
            <div class="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border-2 border-indigo-200/80 shadow-xs">
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <span>📝</span> Edexcel Exam Prompt (${q.marks} Marks)
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-indigo-700 border border-indigo-200">
                  Command Word: "${q.command}"
                </span>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 leading-snug tracking-tight">
                "${q.question}"
              </h3>
            </div>

            <!-- AO1 & AO2 Rubric Guide -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              <!-- AO1 Rubric -->
              <div class="p-3.5 rounded-xl border border-sky-200 bg-sky-50/40">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-bold text-sky-900 flex items-center gap-1">
                    <span>📊</span> AO1 Criteria (Knowledge & Stats)
                  </span>
                  <span class="text-[10px] font-semibold text-sky-700">Level 3: Comprehensive</span>
                </div>
                <p class="text-xs text-slate-700 leading-relaxed font-medium">
                  ${q.ao1Key}
                </p>
                <div class="mt-2 pt-2 border-t border-sky-200/60 text-[11px] text-slate-500">
                  Must include hard numerical facts, dates, measurements, and accurate place names.
                </div>
              </div>

              <!-- AO2 Rubric -->
              <div class="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-bold text-purple-900 flex items-center gap-1">
                    <span>⚖️</span> AO2 Criteria (Evaluation & Synthesis)
                  </span>
                  <span class="text-[10px] font-semibold text-purple-700">Top-Band 16-20m</span>
                </div>
                <p class="text-xs text-slate-700 leading-relaxed font-medium">
                  ${q.ao2Key}
                </p>
                <div class="mt-2 pt-2 border-t border-purple-200/60 text-[11px] text-slate-500">
                  Requires counter-arguments, multiple stakeholder perspectives, and a justified judgment.
                </div>
              </div>

            </div>

            <!-- Student Live Essay Scratchpad -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label for="exam-scratchpad-input" class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>✍️</span> My Essay Plan & Introduction Scratchpad (Auto-saved)
                </label>
                <div class="flex items-center gap-2">
                  <button id="exam-copy-plan-btn" class="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                    <span>📋</span> Copy Plan
                  </button>
                  <span id="exam-saved-indicator" class="text-[11px] text-emerald-600 font-semibold hidden">
                    ✅ Saved
                  </span>
                </div>
              </div>
              <textarea id="exam-scratchpad-input" rows="5" 
                        placeholder="Draft your 3-4 body paragraphs here:&#10;• Intro & Thesis: Define key concept and introduce ${this.currentStudy.title}...&#10;• Paragraph 1 (Strengths / Arguments For): Place-specific stats...&#10;• Paragraph 2 (Limitations / Counter-arguments): Trade-offs, negative externalities...&#10;• Conclusion (AO2 Synthesis): Final evaluative judgment on sustainability/effectiveness..." 
                        class="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm font-sans leading-relaxed bg-slate-50/50">${existingPlan}</textarea>
            </div>

          </div>

          <!-- Footer -->
          <div class="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span class="text-xs text-slate-500">
              💡 Tip: Edexcel rewards students who weave synoptic links into 20-mark conclusions.
            </span>
            <button id="exam-modal-done-btn" class="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm">
              Done Practicing
            </button>
          </div>

        </div>
      </div>
    `;

    // Hook events
    container.querySelector('#exam-modal-close-btn').onclick = () => this.close();
    container.querySelector('#exam-modal-done-btn').onclick = () => this.close();

    container.querySelector('#exam-tab-12').onclick = () => this.setMarks(12);
    container.querySelector('#exam-tab-20').onclick = () => this.setMarks(20);

    container.querySelector('#exam-timer-toggle-btn').onclick = () => this.toggleTimer();
    container.querySelector('#exam-timer-reset-btn').onclick = () => this.resetTimer();

    const scratchpad = container.querySelector('#exam-scratchpad-input');
    const indicator = container.querySelector('#exam-saved-indicator');
    if (scratchpad) {
      scratchpad.oninput = (e) => {
        const text = e.target.value;
        StorageService.setStudentNote(this.currentStudy.id, text);
        this.onSaveNote(this.currentStudy.id, text);
        if (indicator) {
          indicator.classList.remove('hidden');
          setTimeout(() => indicator.classList.add('hidden'), 2000);
        }
      };
    }

    const copyBtn = container.querySelector('#exam-copy-plan-btn');
    if (copyBtn && scratchpad) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(scratchpad.value);
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => copyBtn.innerHTML = '<span>📋</span> Copy Plan', 2000);
      };
    }
  }
}
