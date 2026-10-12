const STORAGE_KEY = 'preppilot-state-v1';

const defaults = {
  profile: { name: 'Aarav Shah', goal: 'Software engineering placement', dailyTarget: 45 },
  skills: [
    { id: 'java', name: 'Java', level: 74, tone: 'violet' },
    { id: 'dsa', name: 'Data structures', level: 61, tone: 'blue' },
    { id: 'communication', name: 'Communication', level: 82, tone: 'mint' },
    { id: 'sql', name: 'SQL', level: 48, tone: 'amber' },
    { id: 'problem-solving', name: 'Problem-solving', level: 67, tone: 'pink' }
  ],
  goals: [
    { id: 'g1', title: 'Complete 2 interview reps', meta: 'Practice behavioral stories', current: 1, target: 2, done: false },
    { id: 'g2', title: 'Solve one array problem', meta: 'Coding fundamentals', current: 1, target: 1, done: true },
    { id: 'g3', title: 'Refresh SQL joins', meta: 'Technical confidence', current: 0, target: 1, done: false }
  ],
  interviewAttempts: [
    { id: 'demo-i1', question: 'Tell me about a time you solved a difficult problem.', category: 'Behavioral', score: 82, date: 'Oct 10' },
    { id: 'demo-i2', question: 'Why should we hire you for this role?', category: 'HR', score: 76, date: 'Oct 08' }
  ],
  codingAttempts: [
    { id: 'demo-c1', title: 'Find the largest number', language: 'Java', score: 90, date: 'Oct 11' },
    { id: 'demo-c2', title: 'Reverse a string', language: 'Python', score: 84, date: 'Oct 06' }
  ],
  history: [
    { id: 'h1', type: 'Interview', title: 'Behavioral story practice', detail: 'Strengths & suggestions reviewed', score: 82, date: 'Today, 09:42', icon: '◌', tone: '' },
    { id: 'h2', type: 'Coding', title: 'Solved “Find the largest number”', detail: 'Java · Arrays', score: 90, date: 'Yesterday', icon: '⌘', tone: 'blue' },
    { id: 'h3', type: 'Skill', title: 'Communication level updated', detail: 'Progress moved to 82%', score: null, date: 'Oct 09', icon: '◒', tone: 'green' }
  ],
  resume: { analyzed: false, score: 72, skills: ['Java', 'SQL', 'Git', 'Problem solving'], suggestions: ['Add measurable impact to two project bullets.', 'Include a concise summary tailored to the target role.', 'Surface testing, collaboration, or deployment keywords.'] },
  streak: 7,
  preferences: { reminders: true, weeklyDigest: true, compactMode: false }
};

let state = loadState();
let currentRoute = routeFromLocation();
let interviewCategory = 'All';
let selectedInterview = 0;
let codingLanguage = 'All';
let selectedCoding = 0;
let lastResumeFile = '';

const interviewQuestions = [
  { category: 'HR', level: 'Warm-up', prompt: 'Walk me through your background and what you are looking for next.', tags: ['Introduction', 'Clarity'] },
  { category: 'HR', level: 'Motivation', prompt: 'Why should we hire you for this role?', tags: ['Value', 'Fit'] },
  { category: 'Behavioral', level: 'STAR method', prompt: 'Tell me about a time you solved a difficult problem.', tags: ['Ownership', 'Problem-solving'] },
  { category: 'Behavioral', level: 'Teamwork', prompt: 'Describe a time you disagreed with a teammate. What did you do?', tags: ['Collaboration', 'Maturity'] },
  { category: 'Technical', level: 'Core Java', prompt: 'Explain the difference between an interface and an abstract class in Java.', tags: ['Java', 'Fundamentals'] },
  { category: 'Technical', level: 'DSA', prompt: 'How would you find a duplicate value in an array efficiently?', tags: ['Arrays', 'Complexity'] }
];

const codingQuestions = [
  { language: 'Java', difficulty: 'Beginner', title: 'Find the largest number', prompt: 'Given an integer array, return the largest value. Explain the approach and its time complexity.', input: '[3, 7, 2, 9, 4]', output: '9', checks: ['max', 'array', '9'] },
  { language: 'Java', difficulty: 'Beginner', title: 'Count vowels', prompt: 'Write a method that counts the vowels (a, e, i, o, u) in a string.', input: '"placement"', output: '3', checks: ['vowel', 'char', '3'] },
  { language: 'Python', difficulty: 'Beginner', title: 'Reverse a string', prompt: 'Return a new string with the characters in reverse order.', input: '"pilot"', output: '"tolip"', checks: ['[::-1]', 'reverse', 'tolip'] },
  { language: 'Python', difficulty: 'Beginner', title: 'Sum even numbers', prompt: 'Given a list of integers, return the sum of all even values.', input: '[2, 5, 8, 1, 4]', output: '14', checks: ['even', 'sum', '14'] },
  { language: 'JavaScript', difficulty: 'Beginner', title: 'Remove duplicates', prompt: 'Return a new array with duplicate values removed while keeping the original order.', input: '[1, 2, 2, 3, 1]', output: '[1, 2, 3]', checks: ['set', 'filter', '[1, 2, 3]'] },
  { language: 'JavaScript', difficulty: 'Beginner', title: 'FizzBuzz', prompt: 'For numbers 1 through n, return Fizz for multiples of 3, Buzz for 5, and FizzBuzz for both.', input: 'n = 5', output: '[1, 2, "Fizz", 4, "Buzz"]', checks: ['fizz', 'buzz', '5'] }
];

const routeMeta = {
  dashboard: { title: 'Dashboard', kicker: 'Your placement cockpit' },
  interview: { title: 'Interview practice', kicker: 'Build your answer muscle' },
  coding: { title: 'Coding practice', kicker: 'Small reps, stronger fundamentals' },
  resume: { title: 'Resume analyzer', kicker: 'Make your first impression count' },
  skills: { title: 'Skill tracker', kicker: 'See what is compounding' },
  progress: { title: 'Progress', kicker: 'Evidence of your momentum' },
  settings: { title: 'Settings', kicker: 'Make PrepPilot fit your routine' }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaults);
    const parsed = JSON.parse(raw);
    return normalizeState(mergeDeep(structuredClone(defaults), parsed));
  } catch (error) {
    return structuredClone(defaults);
  }
}

function normalizeState(data) {
  if (!data || typeof data !== 'object') return structuredClone(defaults);
  data.profile = data.profile && typeof data.profile === 'object' ? data.profile : structuredClone(defaults.profile);
  data.profile.name = typeof data.profile.name === 'string' && data.profile.name.trim() ? data.profile.name : defaults.profile.name;
  data.profile.goal = typeof data.profile.goal === 'string' && data.profile.goal.trim() ? data.profile.goal : defaults.profile.goal;
  data.profile.dailyTarget = Number.isFinite(Number(data.profile.dailyTarget)) ? Math.max(10, Math.min(240, Number(data.profile.dailyTarget))) : defaults.profile.dailyTarget;
  const skills = Array.isArray(data.skills) ? data.skills.filter(skill => skill && typeof skill.name === 'string').map(skill => ({ ...skill, level: Math.max(0, Math.min(100, Number(skill.level) || 0)) })) : [];
  data.skills = skills.length ? skills : structuredClone(defaults.skills);
  data.goals = Array.isArray(data.goals) ? data.goals.filter(item => item && typeof item === 'object') : structuredClone(defaults.goals);
  data.interviewAttempts = Array.isArray(data.interviewAttempts) ? data.interviewAttempts.filter(item => item && typeof item === 'object') : [];
  data.codingAttempts = Array.isArray(data.codingAttempts) ? data.codingAttempts.filter(item => item && typeof item === 'object') : [];
  data.history = Array.isArray(data.history) ? data.history.filter(item => item && typeof item === 'object') : [];
  data.resume = data.resume && typeof data.resume === 'object' ? data.resume : structuredClone(defaults.resume);
  data.resume.skills = Array.isArray(data.resume.skills) ? data.resume.skills.filter(skill => typeof skill === 'string') : structuredClone(defaults.resume.skills);
  data.resume.suggestions = Array.isArray(data.resume.suggestions) ? data.resume.suggestions.filter(item => typeof item === 'string') : structuredClone(defaults.resume.suggestions);
  data.preferences = data.preferences && typeof data.preferences === 'object' ? data.preferences : structuredClone(defaults.preferences);
  data.preferences.reminders = Boolean(data.preferences.reminders);
  data.preferences.weeklyDigest = Boolean(data.preferences.weeklyDigest);
  data.preferences.compactMode = Boolean(data.preferences.compactMode);
  data.streak = Number.isFinite(Number(data.streak)) ? Math.max(0, Number(data.streak)) : defaults.streak;
  return data;
}

function mergeDeep(base, incoming) {
  if (!incoming || typeof incoming !== 'object') return base;
  for (const key of Object.keys(incoming)) {
    if (incoming[key] && typeof incoming[key] === 'object' && !Array.isArray(incoming[key]) && base[key]) base[key] = mergeDeep(base[key], incoming[key]);
    else if (incoming[key] !== undefined) base[key] = incoming[key];
  }
  return base;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  syncChrome();
}

function routeFromLocation() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const match = { '/': 'dashboard', '/dashboard': 'dashboard', '/interview': 'interview', '/coding': 'coding', '/resume': 'resume', '/skills': 'skills', '/progress': 'progress', '/settings': 'settings' };
  return match[path] || 'dashboard';
}

function navigate(route) {
  currentRoute = route;
  const path = route === 'dashboard' ? '/' : `/${route}`;
  if (window.location.pathname !== path) history.pushState({ route }, '', path);
  closeModal();
  closeSidebar();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}
function initials(name) { return name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(); }
function todayLabel() { return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(new Date()); }
function totalAttempts() { return state.interviewAttempts.length + state.codingAttempts.length; }
function preparationScore() { return Math.min(99, Math.round(state.skills.reduce((sum, skill) => sum + skill.level, 0) / state.skills.length * .55 + Math.min(totalAttempts() * 3, 18) + 28)); }
function countCompleted() { return state.codingAttempts.length + state.interviewAttempts.length; }
function skillBy(id) { return state.skills.find(skill => skill.id === id); }
function setPageMeta() {
  const meta = routeMeta[currentRoute];
  document.getElementById('breadcrumb-current').textContent = meta.title;
  document.title = `${meta.title} · PrepPilot`;
}

function render() {
  setPageMeta();
  syncChrome();
  const app = document.getElementById('app');
  const view = ({ dashboard: renderDashboard, interview: renderInterview, coding: renderCoding, resume: renderResume, skills: renderSkills, progress: renderProgress, settings: renderSettings }[currentRoute] || renderDashboard)();
  app.innerHTML = view;
  document.querySelectorAll('[data-route]').forEach(el => el.classList.toggle('active', el.dataset.route === currentRoute));
  if (currentRoute === 'resume' && state.resume.analyzed) updateResumeDial(state.resume.score);
  if (currentRoute === 'dashboard') animateProgressBars();
}

function syncChrome() {
  const name = state.profile.name || 'Student';
  document.body.classList.toggle('compact', Boolean(state.preferences.compactMode));
  document.getElementById('sidebar-name').textContent = name;
  document.getElementById('sidebar-avatar').textContent = initials(name);
  document.getElementById('top-avatar').textContent = initials(name);
  document.getElementById('streak-count').textContent = state.streak;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.route === currentRoute));
}

function pageHeader(kicker, title, subtitle, action = '') {
  return `<div class="page-header"><div><p class="kicker">${kicker}</p><h1 class="page-title">${title}</h1><p class="page-subtitle">${subtitle}</p></div>${action}</div>`;
}

function renderDashboard() {
  const score = preparationScore();
  const completedGoals = state.goals.filter(goal => goal.done).length;
  return `${pageHeader('Monday, October 12 · Week 07', `Keep your edge, ${esc(state.profile.name.split(' ')[0])}.`, 'You are building the kind of consistency recruiters can see. One focused rep today is enough to move the needle.', '<button class="primary-button" data-action="start-session">Start focus session <span class="button-arrow">↗</span></button>')}
    <section class="hero-grid">
      <article class="hero-card"><p class="kicker">This week’s signal</p><h2 class="hero-title">Turn practice into <span>proof.</span></h2><p class="hero-copy">Your strongest pattern is communication. Now pair it with one technical rep to make your profile feel complete.</p><div class="hero-meta"><div class="hero-meta-item"><i>↗</i><b>+12%</b> <span>vs last week</span></div><div class="hero-meta-item"><b>${completedGoals}/${state.goals.length}</b> <span>weekly goals</span></div><div class="hero-meta-item"><b>${state.profile.dailyTarget}m</b> <span>daily target</span></div><div class="hero-meta-item"><b>${state.preferences.reminders ? 'On' : 'Off'}</b> <span>reminders</span></div></div></article>
      <article class="score-card"><div class="card-topline"><div class="card-label"><strong>Preparation score</strong><span>Updated just now</span></div><button class="more" data-action="score-info" aria-label="About preparation score">•••</button></div><div class="score-content"><div class="score-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><circle class="track" cx="60" cy="60" r="54"></circle><circle class="progress" cx="60" cy="60" r="54" style="stroke-dashoffset:${339 - score * 2.45}"></circle></svg><div class="score-number"><strong>${score}</strong><span>/ 100</span></div></div><div><div class="score-change">↑ 8 pts this week</div><p class="score-note">You are ahead of 68% of PrepPilot learners at your stage.</p></div></div></article>
    </section>
    <section class="stat-grid">
      ${statCard('⌘', countCompleted(), 'Practice reps logged', '+3 this week')}
      ${statCard('◌', state.interviewAttempts.length, 'Interview answers', '+2 this week')}
      ${statCard('◒', Math.round(state.skills.reduce((sum, s) => sum + s.level, 0) / state.skills.length) + '%', 'Average skill strength', '↑ 6% this month')}
      ${statCard('✦', state.streak, 'Day streak', 'Keep it alive')}
    </section>
    <section class="two-col"><article class="card"><div class="card-header"><div><h2 class="card-title">Skill strengths</h2><p class="card-subtitle">Your current confidence map</p></div><button class="link-button" data-route="skills">Manage skills →</button></div><div class="skill-list">${state.skills.map(skill => skillRow(skill)).join('')}</div></article><article class="card"><div class="card-header"><div><h2 class="card-title">Weekly goals</h2><p class="card-subtitle">${completedGoals} of ${state.goals.length} complete</p></div><button class="link-button" data-route="progress">View history →</button></div><div class="goal-list">${state.goals.map(goal => goalItem(goal)).join('')}</div></article></section>
    ${activityCard()}`;
}

function statCard(icon, value, title, trend) { return `<article class="stat-card"><div class="stat-icon">${icon}</div><div><strong class="stat-value">${value}</strong><span class="stat-unit"></span><span class="stat-trend">${trend}</span></div><p class="stat-title">${title}</p></article>`; }
function skillRow(skill) { return `<div class="skill-row"><span>${esc(skill.name)}</span><div class="progress-track"><div class="progress-fill" style="width:${skill.level}%"></div></div><b>${skill.level}%</b></div>`; }
function goalItem(goal) { return `<div class="goal-item"><div class="goal-check ${goal.done ? '' : 'pending'}">✓</div><div><strong>${esc(goal.title)}</strong><span>${esc(goal.meta)}</span></div><div class="goal-progress">${goal.current}/${goal.target}</div></div>`; }
function activityCard() { const items = state.history.slice(0, 4); return `<article class="card activity-card"><div class="card-header"><div><h2 class="card-title">Recent activity</h2><p class="card-subtitle">A quick look at your last reps</p></div><div style="display:flex;align-items:center;gap:12px"><span class="small-muted">${state.preferences.weeklyDigest ? 'Weekly digest on' : 'Digest paused'}</span><button class="link-button" data-route="progress">See all activity →</button></div></div>${items.length ? `<div class="activity-list">${items.map(item => `<div class="activity-item"><div class="activity-icon ${item.tone}">${item.icon}</div><div><strong>${esc(item.title)}</strong><span>${esc(item.detail)}</span></div><span class="activity-time">${esc(item.date)}</span></div>`).join('')}</div>` : `<div class="empty-state"><strong>Your activity feed is ready.</strong><p>Complete your first practice rep and it will appear here.</p></div>`}</article>`; }

function renderInterview() {
  const filtered = interviewQuestions.filter(question => interviewCategory === 'All' || question.category === interviewCategory);
  const question = filtered[selectedInterview % Math.max(filtered.length, 1)] || interviewQuestions[0];
  return `${pageHeader('Practice room · rule-based demo', 'Make your answer memorable.', 'Choose a prompt, write it like you are in the room, and get transparent coaching on structure, specificity, and impact.', '<button class="secondary-button" data-action="interview-tip">How feedback works <span class="button-arrow">?</span></button>')}
  <div class="practice-layout"><aside class="card"><div class="card-header"><div><h2 class="card-title">Question bank</h2><p class="card-subtitle">${filtered.length} prompts in view</p></div></div><div class="filter-tabs">${['All', 'HR', 'Behavioral', 'Technical'].map(category => `<button class="filter-tab ${interviewCategory === category ? 'active' : ''}" data-interview-category="${category}">${category}</button>`).join('')}</div><div class="question-list">${filtered.map((item, index) => `<button class="${item.prompt === question.prompt ? 'selected' : ''}" data-interview-index="${index}"><small>${item.category} · ${item.level}</small><strong>${esc(item.prompt)}</strong></button>`).join('')}</div></aside><section class="card question-card"><div class="question-number"><span>QUESTION ${String(filtered.indexOf(question) + 1).padStart(2, '0')} / ${String(filtered.length).padStart(2, '0')}</span><b>Rule-based demo feedback</b></div><h2 class="question-text">${esc(question.prompt)}</h2><div class="tag-row">${question.tags.map(tag => `<span class="tag">${esc(tag)}</span>`).join('')}</div><div class="answer-box"><div class="form-field"><label for="interview-answer">Your answer</label><textarea id="interview-answer" placeholder="Use a clear story: context, your action, and the result…"></textarea><span class="field-hint">Tip: aim for 80–150 words and include one concrete outcome.</span></div><div class="form-actions"><button class="primary-button" data-action="submit-interview" data-question="${esc(question.prompt)}">Get feedback <span class="button-arrow">↗</span></button><button class="secondary-button" data-action="next-interview">Skip question</button></div><div id="interview-feedback"></div></div></section></div>`;
}

function renderCoding() {
  const filtered = codingQuestions.filter(question => codingLanguage === 'All' || question.language === codingLanguage);
  const question = filtered[selectedCoding % Math.max(filtered.length, 1)] || codingQuestions[0];
  return `${pageHeader('Practice room · answer checker', 'Code with intent.', 'Work through beginner-friendly prompts in the language you are targeting. The checker is educational and transparent — it does not compile or execute code.', '<button class="secondary-button" data-action="coding-tip">Coding tips <span class="button-arrow">?</span></button>')}
  <div class="practice-layout"><aside class="card coding-sidebar"><div class="card-header"><div><h2 class="card-title">Problem set</h2><p class="card-subtitle">${filtered.length} prompts in view</p></div></div><div class="filter-tabs">${['All', 'Java', 'Python', 'JavaScript'].map(language => `<button class="filter-tab ${codingLanguage === language ? 'active' : ''}" data-coding-language="${language}">${language}</button>`).join('')}</div><div class="question-list">${filtered.map((item, index) => `<button class="${item.title === question.title ? 'selected' : ''}" data-coding-index="${index}"><small>${item.language} · ${item.difficulty}</small><strong>${esc(item.title)}</strong></button>`).join('')}</div></aside><section class="card question-card"><div class="question-number"><span>${question.language.toUpperCase()} · ${question.difficulty.toUpperCase()}</span><b>Educational checker</b></div><h2 class="question-text">${esc(question.title)}</h2><p class="page-subtitle" style="margin:0;max-width:none">${esc(question.prompt)}</p><div class="code-prompt"><div class="prompt-box"><small>Example input</small><code>${esc(question.input)}</code></div><div class="prompt-box"><small>Expected output</small><code>${esc(question.output)}</code></div></div><div class="form-field"><label for="code-answer">Your approach or solution</label><textarea id="code-answer" class="code-editor" placeholder="Write your code or explain your approach here…"></textarea></div><div class="form-actions"><button class="primary-button" data-action="check-code" data-title="${esc(question.title)}">Check answer <span class="button-arrow">↗</span></button><button class="secondary-button" data-action="next-coding">Next problem</button></div><div id="coding-feedback"></div></section></div>`;
}

function renderResume() {
  const resume = state.resume;
  return `${pageHeader('Resume lab · simulated analysis', 'Make your story scan-ready.', 'Paste your resume text or upload a text file to get a transparent ATS-style simulation and practical next edits.', '<button class="secondary-button" data-action="resume-method">What is simulated? <span class="button-arrow">?</span></button>')}
  <div class="resume-layout"><section class="card"><div class="card-header"><div><h2 class="card-title">Resume input</h2><p class="card-subtitle">Your content stays in this browser demo</p></div><span class="tag">No API connected</span></div><div class="upload-zone"><div class="upload-icon">↑</div><div><strong id="file-name">${lastResumeFile ? esc(lastResumeFile) : 'Drop a resume file here'}</strong><span>TXT works directly · PDF/DOCX can be paired with pasted text</span></div><label for="resume-file">Choose file<input id="resume-file" type="file" accept=".txt,.md,.pdf,.doc,.docx" /></label></div><div class="form-field"><label for="resume-text">Paste resume text</label><textarea id="resume-text" style="min-height:290px" placeholder="Paste your resume content here…">${resume.lastText ? esc(resume.lastText) : ''}</textarea><span class="field-hint">For the most useful simulation, include your summary, skills, projects, education, and experience sections.</span></div><div class="form-actions"><button class="primary-button" data-action="analyze-resume">Analyze resume <span class="button-arrow">↗</span></button><button class="secondary-button" data-action="load-resume-demo">Use demo resume</button></div><div id="resume-feedback"></div></section><section class="card"><div class="card-header"><div><h2 class="card-title">ATS-style snapshot</h2><p class="card-subtitle">${resume.analyzed ? 'Latest simulated result' : 'Run an analysis to see your snapshot'}</p></div><span class="tag">SIMULATED</span></div>${resume.analyzed ? resumeResult(resume) : `<div class="empty-state"><strong>Your score is waiting.</strong><p>Paste a resume or load the demo to generate a simulated score, skills summary, and next edits.</p></div>`}</section></div>`;
}

function resumeResult(resume) { const dash = 352 - (resume.score / 100 * 352); return `<div class="ats-score"><div class="ats-dial"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="track" cx="60" cy="60" r="56"></circle><circle class="value" cx="60" cy="60" r="56" style="stroke-dashoffset:${dash}"></circle></svg><div class="ats-score-number"><strong>${resume.score}</strong><span>out of 100</span></div></div><div class="score-legend"><strong>${resume.score >= 80 ? 'Strong foundation' : resume.score >= 65 ? 'Good starting point' : 'Room to sharpen'}</strong><p>Simulated ATS-style score. No resume API or external AI service is connected.</p></div></div><div class="analysis-list"><div class="analysis-row"><i>✓</i><span>Detected skills and keywords from your content.</span></div><div class="analysis-row"><i>✓</i><span>Checked for common resume sections and action language.</span></div><div class="analysis-row warn"><i>!</i><span>Use the suggestions below to improve scanability.</span></div></div><div style="margin-top:21px"><p class="card-subtitle" style="margin-bottom:10px">Skills detected</p><div class="skill-chip-wrap">${resume.skills.map(skill => `<span class="skill-chip">${esc(skill)}</span>`).join('')}</div></div><div style="margin-top:21px"><p class="card-subtitle" style="margin-bottom:10px">Next edits</p><div class="analysis-list" style="margin-top:0">${resume.suggestions.map(suggestion => `<div class="analysis-row warn"><i>→</i><span>${esc(suggestion)}</span></div>`).join('')}</div></div>`; }

function renderSkills() { return `${pageHeader('Your capability map', 'Make progress visible.', 'Update your confidence levels after each study block. The dashboard and progress view will reflect your latest map.', '<button class="primary-button" data-action="add-skill">Add a skill <span class="button-arrow">+</span></button>')}<div class="two-col"><section class="card"><div class="card-header"><div><h2 class="card-title">Core placement skills</h2><p class="card-subtitle">Drag each slider to match your current confidence</p></div><span class="tag">${state.skills.length} tracked</span></div><div class="skill-tracker-list">${state.skills.map(skill => `<div class="tracker-item"><div class="tracker-heading"><strong>${esc(skill.name)}</strong><span id="skill-value-${skill.id}">${skill.level}%</span></div><input type="range" min="0" max="100" value="${skill.level}" data-skill-id="${skill.id}" aria-label="${esc(skill.name)} progress" /><div class="tracker-foot"><span>Needs reps</span><span>Interview-ready</span></div></div>`).join('')}</div></section><section class="card"><div class="card-header"><div><h2 class="card-title">Strength snapshot</h2><p class="card-subtitle">Where your next hour could have the most lift</p></div></div>${skillStrengthCard()}<div class="alert info">Small suggestion: pair your strongest skill with one weaker skill in every study session. That is how confidence transfers.</div></section></div>`; }
function skillStrengthCard() { const sorted = [...state.skills].sort((a,b) => b.level - a.level); return `<div class="skill-list">${sorted.map(skill => skillRow(skill)).join('')}</div>`; }

function weeklyPulse() { const base = [32, 36, 42, 48, 54, 61, 68]; const recent = state.history.slice(0, 7); return base.map((value, index) => Math.min(100, value + Math.min(25, recent.length * 2) + (recent[index]?.score ? Math.round(recent[index].score / 12) : 0))); }
function renderProgress() { const bars = weeklyPulse(); const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; return `${pageHeader('Your evidence', 'Momentum looks good on you.', 'Every answer, solution, and skill update becomes a signal you can build on.', '<button class="secondary-button" data-action="export-progress">Export summary <span class="button-arrow">↓</span></button>')}<section class="stat-grid">${statCard('↗', preparationScore(), 'Preparation score', '+8 this week')}${statCard('◌', state.interviewAttempts.length, 'Interview scores', 'Average '+averageInterview()+'%')}${statCard('⌘', state.codingAttempts.length, 'Coding exercises', '2 languages')}${statCard('◷', state.history.length, 'Activity events', 'Saved locally')}</section><section class="two-col"><article class="card"><div class="card-header"><div><h2 class="card-title">Weekly preparation pulse</h2><p class="card-subtitle">Minutes of intentional practice · shaped by saved activity</p></div><span class="tag">This week</span></div><div class="chart-wrap">${bars.map((bar,index) => `<div class="chart-column"><span class="chart-value">${Math.round(bar * .6)}m</span><div class="chart-bar-wrap"><div class="chart-bar" style="height:${bar}%"></div></div><span class="chart-label">${labels[index]}</span></div>`).join('')}</div></article><article class="card"><div class="card-header"><div><h2 class="card-title">Interview confidence</h2><p class="card-subtitle">Your last recorded practice scores</p></div></div><div class="skill-list">${state.interviewAttempts.slice(0,4).map(attempt => `<div class="skill-row"><span style="width:125px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(attempt.category)}</span><div class="progress-track"><div class="progress-fill" style="width:${attempt.score}%"></div></div><b>${attempt.score}</b></div>`).join('') || `<div class="empty-state"><strong>No interview scores yet</strong><p>Practice one answer to see your confidence pattern.</p></div>`}</div></article></section><article class="card activity-card"><div class="card-header"><div><h2 class="card-title">Preparation history</h2><p class="card-subtitle">Your saved practice record</p></div><span class="small-muted">${state.history.length} events</span></div>${state.history.length ? `<div class="table-scroll"><table class="history-table"><thead><tr><th>Activity</th><th>Type</th><th>Score</th><th>Date</th></tr></thead><tbody>${state.history.map(item => `<tr><td><strong>${esc(item.title)}</strong><span>${esc(item.detail)}</span></td><td>${esc(item.type)}</td><td>${item.score ? `<span class="score-badge">${item.score}%</span>` : '—'}</td><td>${esc(item.date)}</td></tr>`).join('')}</tbody></table></div>` : `<div class="empty-state"><strong>Your history is empty.</strong><p>Complete an interview or coding rep to start building your evidence.</p></div>`}</article>`; }
function averageInterview() { return state.interviewAttempts.length ? Math.round(state.interviewAttempts.reduce((sum, item) => sum + item.score, 0) / state.interviewAttempts.length) : 0; }

function renderSettings() { return `${pageHeader('Personal workspace', 'Tune your routine.', 'Your preferences are saved in this browser. No account or external service is required for the demo.', '<button class="primary-button" data-action="save-settings">Save changes <span class="button-arrow">✓</span></button>')}<div class="two-col"><section class="card"><div class="card-header"><div><h2 class="card-title">Profile</h2><p class="card-subtitle">Shape the coaching language around your goal</p></div></div><div class="form-grid"><div class="form-field full"><label for="profile-name">Your name</label><input id="profile-name" value="${esc(state.profile.name)}" required /></div><div class="form-field full"><label for="profile-goal">Placement goal</label><input id="profile-goal" value="${esc(state.profile.goal)}" required /></div><div class="form-field"><label for="daily-target">Daily target (minutes)</label><input id="daily-target" type="number" min="10" max="240" value="${state.profile.dailyTarget}" required /></div></div></section><section class="card"><div class="card-header"><div><h2 class="card-title">Preferences</h2><p class="card-subtitle">A little structure helps consistency</p></div></div><div class="setting-list"><div class="setting-row"><div><strong>Practice reminders</strong><p>Keep the next rep visible on your dashboard.</p></div><button class="toggle ${state.preferences.reminders ? 'on' : ''}" data-setting="reminders" aria-label="Toggle practice reminders"><i></i></button></div><div class="setting-row"><div><strong>Weekly progress digest</strong><p>Show a simple Sunday review prompt.</p></div><button class="toggle ${state.preferences.weeklyDigest ? 'on' : ''}" data-setting="weeklyDigest" aria-label="Toggle weekly digest"><i></i></button></div><div class="setting-row"><div><strong>Compact information density</strong><p>Use tighter cards when you want more on screen.</p></div><button class="toggle ${state.preferences.compactMode ? 'on' : ''}" data-setting="compactMode" aria-label="Toggle compact mode"><i></i></button></div></div><div class="alert info">PrepPilot is currently running as a local-first demo. Add an AI service later if you want generated feedback beyond the transparent rules.</div></section></div>`; }

function submitInterview() {
  const answer = document.getElementById('interview-answer')?.value.trim();
  const target = document.getElementById('interview-feedback');
  if (!answer) { target.innerHTML = `<div class="alert error">Write an answer first so PrepPilot can coach the structure. Required field.</div>`; return; }
  const feedback = interviewFeedback(answer);
  const currentQuestion = document.querySelector('[data-action="submit-interview"]')?.dataset.question || 'Interview practice';
  const existing = state.interviewAttempts.find(item => item.question === currentQuestion);
  const record = { id: existing?.id || `i-${Date.now()}`, question: currentQuestion, category: currentQuestion.includes('Java') ? 'Technical' : currentQuestion.includes('time') ? 'Behavioral' : 'HR', score: feedback.score, date: todayLabel() };
  if (existing) Object.assign(existing, record); else state.interviewAttempts.unshift(record);
  state.history.unshift({ id: `h-${Date.now()}`, type: 'Interview', title: 'Interview answer reviewed', detail: 'Rule-based strengths & suggestions', score: feedback.score, date: 'Just now', icon: '◌', tone: '' });
  saveState();
  target.innerHTML = `<div class="alert success">Feedback ready. Your answer earned a ${feedback.score}% structure score — use the suggestions for one more rep.</div><div class="feedback-grid"><div class="feedback-box"><h4>Strengths</h4><ul>${feedback.strengths.map(item => `<li>${esc(item)}</li>`).join('')}</ul></div><div class="feedback-box suggest"><h4>Suggestions</h4><ul>${feedback.suggestions.map(item => `<li>${esc(item)}</li>`).join('')}</ul></div></div><div class="feedback-score"><b>${feedback.score}%</b> demo structure score <span>· no AI API connected</span></div>`;
  toast('Interview feedback saved to your progress.', 'success');
}
function interviewFeedback(answer) { const lower = answer.toLowerCase(); const strengths = []; const suggestions = []; let score = 54; if (answer.length >= 100) { score += 12; strengths.push('Good depth for a spoken response.'); } else suggestions.push('Add one more sentence of context so the listener can follow the setup.'); if (/i |my |we |our /i.test(answer)) { score += 8; strengths.push('Uses ownership language instead of staying abstract.'); } else suggestions.push('Use “I” to make your individual contribution clear.'); if (/(result|impact|improved|increased|reduced|learned|delivered|%|percent)/i.test(lower)) { score += 13; strengths.push('Includes an outcome or learning signal.'); } else suggestions.push('Close with a result, metric, or what you learned.'); if (/(because|when|then|so that|therefore)/i.test(lower)) { score += 7; strengths.push('Shows a clear cause-and-effect flow.'); } else suggestions.push('Connect the action to the outcome with a simple “so that” sentence.'); if (!strengths.length) strengths.push('You started the rep — that is the hardest part.'); return { score: Math.min(96, score), strengths, suggestions }; }

function checkCode() { const answer = document.getElementById('code-answer')?.value.trim(); const target = document.getElementById('coding-feedback'); const title = document.querySelector('[data-action="check-code"]')?.dataset.title || 'Coding exercise'; const question = codingQuestions.find(item => item.title === title) || codingQuestions[0]; if (!answer) { target.innerHTML = `<div class="alert error">Add your approach or code before checking. Required field.</div>`; return; } const lower = answer.toLowerCase(); const matched = question.checks.filter(check => lower.includes(check.toLowerCase())).length; const score = Math.min(98, 56 + matched * 14); const passed = matched >= 2; const feedback = passed ? `Nice work — your approach includes ${question.language}-appropriate signals for this problem.` : `You have a starting point. Try naming the core operation and the expected output before submitting again.`; state.codingAttempts.unshift({ id: `c-${Date.now()}`, title: question.title, language: question.language, score, date: todayLabel() }); state.history.unshift({ id: `h-${Date.now()}`, type: 'Coding', title: `Worked on “${question.title}”`, detail: `${question.language} · educational checker`, score, date: 'Just now', icon: '⌘', tone: 'blue' }); saveState(); target.innerHTML = `<div class="alert ${passed ? 'success' : 'info'}">${feedback} ${passed ? 'This is a keyword-based demo check, not a compiler.' : 'Review the prompt and take another pass.'}</div>`; toast('Coding attempt saved to your progress.', 'success'); }

function analyzeResume(text) { const lower = text.toLowerCase(); const sectionWords = ['summary', 'experience', 'education', 'skills', 'projects']; const foundSections = sectionWords.filter(word => lower.includes(word)); const keywords = ['java', 'python', 'javascript', 'sql', 'git', 'react', 'api', 'testing', 'communication', 'data structures', 'problem solving', 'leadership']; const foundSkills = keywords.filter(word => lower.includes(word)); const actionWords = ['built', 'created', 'improved', 'led', 'designed', 'implemented', 'reduced', 'increased', 'developed', 'delivered']; const actionCount = actionWords.filter(word => lower.includes(word)).length; const score = Math.min(96, Math.max(38, 40 + foundSections.length * 7 + Math.min(foundSkills.length * 2, 18) + Math.min(actionCount * 3, 15) + (text.length > 450 ? 8 : 0))); const suggestions = []; if (!lower.includes('summary')) suggestions.push('Add a concise summary tailored to the target role.'); if (actionCount < 3) suggestions.push('Start more project bullets with measurable action verbs.'); if (!/\d+%|\d+ users|\d+ projects|\d+ms/i.test(text)) suggestions.push('Add measurable impact to two project bullets.'); if (!lower.includes('testing') && !lower.includes('deployment')) suggestions.push('Surface testing, collaboration, or deployment keywords.'); if (!suggestions.length) suggestions.push('Keep the strongest metrics near the top of each experience entry.'); return { analyzed: true, score, skills: foundSkills.length ? foundSkills.map(word => word.replace(/\b\w/g, c => c.toUpperCase())) : ['Add target-role keywords'], suggestions, lastText: text }; }
function updateResumeDial(score) { const dial = document.querySelector('.ats-dial .value'); if (dial) dial.style.strokeDashoffset = 352 - (score / 100 * 352); }

function animateProgressBars() { requestAnimationFrame(() => document.querySelectorAll('.progress-fill').forEach(el => { const width = el.style.width; el.style.width = '0'; requestAnimationFrame(() => { el.style.width = width; }); })); }
function toast(message, type = '') { const region = document.getElementById('toast-region'); const node = document.createElement('div'); node.className = `toast ${type}`; node.textContent = message; region.appendChild(node); setTimeout(() => node.remove(), 3400); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); }
function closeModal() { const backdrop = document.getElementById('modal-backdrop'); backdrop.hidden = true; document.getElementById('modal-content').innerHTML = ''; }
function showModal(title, body, actions = '<button class="primary-button" data-action="close-modal">Got it</button>') { const backdrop = document.getElementById('modal-backdrop'); document.getElementById('modal-content').innerHTML = `<p class="kicker">PrepPilot note</p><h2 id="modal-title">${title}</h2><p>${body}</p>${actions}`; backdrop.hidden = false; }

function handleAction(action, element) {
  if (action === 'start-session') { showModal('Choose your next rep', 'Start with a 10-minute interview answer or a beginner coding prompt. Both count toward your weekly momentum.', '<div class="form-actions"><button class="primary-button" data-route="interview">Interview rep <span class="button-arrow">↗</span></button><button class="secondary-button" data-route="coding">Coding rep</button></div>'); return; }
  if (action === 'submit-interview') { submitInterview(); return; }
  if (action === 'next-interview') { selectedInterview += 1; render(); return; }
  if (action === 'check-code') { checkCode(); return; }
  if (action === 'next-coding') { selectedCoding += 1; render(); return; }
  if (action === 'analyze-resume') { const text = document.getElementById('resume-text')?.value.trim(); const feedback = document.getElementById('resume-feedback'); if (!text && !lastResumeFile) { feedback.innerHTML = `<div class="alert error">Paste resume text or choose a file before analyzing. Required input.</div>`; return; } if (!text && lastResumeFile) { feedback.innerHTML = `<div class="alert info">${esc(lastResumeFile)} is selected. Paste its text to run the browser-only simulation; the filename will not be scored.</div>`; return; } state.resume = analyzeResume(text); saveState(); render(); toast('Simulated resume analysis complete.', 'success'); return; }
  if (action === 'load-resume-demo') { const demo = 'SUMMARY\nComputer science student focused on software engineering placements.\n\nSKILLS\nJava, Python, SQL, Git, React, data structures, problem solving.\n\nPROJECTS\nBuilt a placement tracker used by 120 students; improved page load speed by 35%.\n\nEXPERIENCE\nDeveloped REST APIs, implemented testing, and delivered weekly features with a team.\n\nEDUCATION\nB.Tech in Computer Science, 2027'; const field = document.getElementById('resume-text'); if (field) field.value = demo; toast('Demo resume loaded. Review it, then run the simulation.'); return; }
  if (action === 'resume-method') { showModal('What is simulated?', 'PrepPilot checks the text in this browser for common resume sections, target-role keywords, action verbs, and evidence of measurable impact. It is an educational ATS-style signal, not a real ATS or AI service.'); return; }
  if (action === 'interview-tip') { showModal('How feedback works', 'This demo checks four visible signals: enough detail, ownership language, cause-and-effect flow, and a result or learning. It labels itself as rule-based so you always know what is — and is not — AI.'); return; }
  if (action === 'coding-tip') { showModal('How the checker works', 'The answer checker looks for a few concepts associated with the selected prompt and its expected output. It does not run code, so use it as a reflection aid before testing in your own IDE.'); return; }
  if (action === 'score-info') { showModal('Preparation score', 'This demo score combines your average skill levels with saved interview and coding reps. It is a progress signal for this browser, not a hiring prediction.'); return; }
  if (action === 'notifications') { toast('You are on track: one interview rep completes today’s focus goal.', 'success'); return; }
  if (action === 'quick-search') { showModal('Quick search', 'Use the navigation rail to jump into interview practice, coding practice, resume analysis, skills, progress, or settings.'); return; }
  if (action === 'close-modal') { closeModal(); return; }
  if (action === 'add-skill') { const name = window.prompt('Skill name'); if (!name?.trim()) return; const id = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'); if (state.skills.some(skill => skill.id === id)) { toast('That skill is already tracked.', 'error'); return; } state.skills.push({ id, name: name.trim(), level: 25, tone: 'violet' }); state.history.unshift({ id: `h-${Date.now()}`, type: 'Skill', title: `${name.trim()} added to tracker`, detail: 'Starting level: 25%', score: null, date: 'Just now', icon: '◒', tone: 'green' }); saveState(); render(); toast(`${name.trim()} added to your skill map.`, 'success'); return; }
  if (action === 'save-settings') { const name = document.getElementById('profile-name')?.value.trim(); const goal = document.getElementById('profile-goal')?.value.trim(); const target = Number(document.getElementById('daily-target')?.value); if (!name || !goal || !target || target < 10 || target > 240) { toast('Complete the required profile fields with a target between 10 and 240 minutes.', 'error'); return; } state.profile = { name, goal, dailyTarget: target }; saveState(); render(); toast('Workspace preferences saved.', 'success'); return; }
  if (action === 'export-progress') { const summary = `PrepPilot progress summary\nPreparation score: ${preparationScore()}/100\nPractice reps: ${countCompleted()}\nAverage interview score: ${averageInterview()}%\nSkills: ${state.skills.map(skill => `${skill.name} ${skill.level}%`).join(', ')}`; navigator.clipboard?.writeText(summary).then(() => toast('Progress summary copied to clipboard.', 'success')).catch(() => showModal('Progress summary', summary)); return; }
}

document.addEventListener('click', event => {
  const routeTarget = event.target.closest('[data-route]');
  if (routeTarget) { event.preventDefault(); navigate(routeTarget.dataset.route); return; }
  const actionTarget = event.target.closest('[data-action]');
  if (actionTarget) { handleAction(actionTarget.dataset.action, actionTarget); return; }
  const interviewTab = event.target.closest('[data-interview-category]');
  if (interviewTab) { interviewCategory = interviewTab.dataset.interviewCategory; selectedInterview = 0; render(); return; }
  const interviewIndex = event.target.closest('[data-interview-index]');
  if (interviewIndex) { selectedInterview = Number(interviewIndex.dataset.interviewIndex); render(); return; }
  const codingTab = event.target.closest('[data-coding-language]');
  if (codingTab) { codingLanguage = codingTab.dataset.codingLanguage; selectedCoding = 0; render(); return; }
  const codingIndex = event.target.closest('[data-coding-index]');
  if (codingIndex) { selectedCoding = Number(codingIndex.dataset.codingIndex); render(); return; }
  const toggle = event.target.closest('[data-setting]');
  if (toggle) { const key = toggle.dataset.setting; state.preferences[key] = !state.preferences[key]; saveState(); render(); return; }
  if (event.target.id === 'modal-backdrop') closeModal();
});

document.addEventListener('input', event => {
  const slider = event.target.closest('[data-skill-id]');
  if (slider) { const skill = skillBy(slider.dataset.skillId); if (skill) { skill.level = Number(slider.value); const value = document.getElementById(`skill-value-${skill.id}`); if (value) value.textContent = `${skill.level}%`; saveState(); } }
});

document.addEventListener('change', event => {
  const slider = event.target.closest('[data-skill-id]');
  if (slider) { const skill = skillBy(slider.dataset.skillId); if (skill) { state.history.unshift({ id: `h-${Date.now()}`, type: 'Skill', title: `${skill.name} level updated`, detail: `Progress moved to ${skill.level}%`, score: null, date: 'Just now', icon: '◒', tone: 'green' }); saveState(); toast(`${skill.name} progress saved at ${skill.level}%.`, 'success'); } }
  if (event.target.id === 'resume-file') { const file = event.target.files?.[0]; if (!file) return; lastResumeFile = file.name; const label = document.getElementById('file-name'); if (label) label.textContent = file.name; if (file.type.startsWith('text/') || file.name.endsWith('.md')) { const reader = new FileReader(); reader.onload = () => { const field = document.getElementById('resume-text'); if (field) field.value = reader.result; }; reader.readAsText(file); } else toast('File selected. Paste its text for the browser-only analyzer.', ''); }
});

document.getElementById('mobile-menu').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
window.addEventListener('popstate', () => { currentRoute = routeFromLocation(); render(); });
render();
