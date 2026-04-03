'use strict';

/* ========================================================
   НЕЙРО-ЩИФТ | script.js
   Google Gemini 2.0 Flash + локальный анализатор (фолбэк)
   ======================================================== */

/* -------- SCROLL PROGRESS -------- */
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
  document.getElementById('scroll-progress').style.width = Math.min(pct, 100) + '%';
});

/* -------- NAVBAR -------- */
const navBurger = document.getElementById('nav-burger');
const navMobile = document.getElementById('nav-mobile');
navBurger.addEventListener('click', () => navMobile.classList.toggle('open'));
function closeMobileMenu() { navMobile.classList.remove('open'); }

/* ========================================================
   НАСТРОЙКИ GEMINI API
   ======================================================== */
const GEMINI_KEY_LS = 'neuroshift_gemini_key';
const GEMINI_MODEL = 'gemini-2.0-flash';

function getGeminiKey() { return localStorage.getItem(GEMINI_KEY_LS) || ''; }

function saveGeminiKey() {
  const inp = document.getElementById('gemini-api-input');
  const key = inp.value.trim();
  const status = document.getElementById('smodal-status');
  if (!key || !key.startsWith('AIza')) {
    status.textContent = '❌ Некорректный ключ. Он должен начинаться с «AIza»';
    status.className = 'smodal-status err';
    return;
  }
  localStorage.setItem(GEMINI_KEY_LS, key);
  status.textContent = '✅ Ключ сохранён. Gemini AI активирован!';
  status.className = 'smodal-status ok';
  updateAIBadge();
  setTimeout(closeSettings, 1400);
}

function clearGeminiKey() {
  localStorage.removeItem(GEMINI_KEY_LS);
  const inp = document.getElementById('gemini-api-input');
  if (inp) inp.value = '';
  const status = document.getElementById('smodal-status');
  status.textContent = 'Ключ удалён. Используется локальный анализатор.';
  status.className = 'smodal-status';
  updateAIBadge();
}

function openSettings() {
  const modal = document.getElementById('settings-modal');
  const backdrop = document.getElementById('settings-backdrop');
  const inp = document.getElementById('gemini-api-input');
  const status = document.getElementById('smodal-status');
  const key = getGeminiKey();
  if (key) inp.value = key;
  status.textContent = '';
  status.className = 'smodal-status';
  modal.style.display = 'block';
  backdrop.style.display = 'block';
  inp.focus();
}

function closeSettings() {
  document.getElementById('settings-modal').style.display = 'none';
  document.getElementById('settings-backdrop').style.display = 'none';
}

function updateAIBadge() {
  const badge = document.getElementById('ai-mode-badge');
  const badgeTxt = document.getElementById('ai-badge-text');
  const setupBtn = document.querySelector('.ai-setup-link');
  const key = getGeminiKey();
  if (key) {
    badge.className = 'ai-engine-badge gemini-active';
    badgeTxt.textContent = '◈ Gemini 2.0 Flash — активен';
    if (setupBtn) setupBtn.textContent = '⚙️ Сменить ключ';
  } else {
    badge.className = 'ai-engine-badge local-active';
    badgeTxt.textContent = '◇ Локальный анализатор';
    if (setupBtn) setupBtn.textContent = '⚙️ Настроить Gemini API';
  }
}

// Инициализация бейджа при загрузке
document.addEventListener('DOMContentLoaded', updateAIBadge);
updateAIBadge();

/* ========================================================
   GEMINI API CALL
   ======================================================== */
async function callGeminiAPI(text, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const prompt = `Ты — передовая нейроэндокринная AI-система "НейроЩифт" (версия 2.0.4), разработанная для киберзащиты граждан Республики Беларусь от современного социального и интернет-мошенничества. Ты работаешь на благо общества.
Твоя база знаний включает актуальные поручения Президента Республики Беларусь Александра Лукашенко по защите населения от цифровой преступности, а также официальные рекомендации МВД Республики Беларусь под руководством министра внутренних дел Ивана Кубракова (генерал-лейтенанта милиции).

Твоя задача — внимательно проанализировать текст и САМОСТОЯТЕЛЬНО подумать: какова реальная угроза? Оцени ситуацию логически, как детектив и эксперт в области социальной инженерии, а не просто по чек-листу. Тебе нужно понимать сценарий мошенников.
Твой процент угрозы (threatPercent) должен точно отражать реальную опасность (от 0 до 100), основываясь на контексте! 

Схемы, популярные в Беларуси (повод для высокой угрозы):
1. 'Оформление кредита без вашего ведома' — вишинг от лжесотрудников Беларусбанка, МТБ Банка, Приорбанка, КГК.
2. Поддельные ссылки и лже-площадки Куфара ("Безопасная сделка" в мессенджере).
3. 'Пенсионерская реформа', обмены купонов/валюты, звонки из СК/КТК, просьба перевести деньги на "резервный защищенный счёт Нацбанка". 
4. 'Ваш родственник попал в ДТП' и запросы курьеров.
5. Любая просьба установить AnyDesk или скачать приложение банка из Telegram-бота.

Как ставить threatPercent:
- Явный обман с социальной инженерией: ставь 80-100%
- Подозрительное предложение (например, выгодные инвестиции в тг): ставь 45-75%
- Обычная переписка (даже с покупками у друзей): ставь 0-25%.

Отвечай ТОЛЬКО JSON (без markdown, без комментариев снаружи JSON):
{
  "threatPercent": <число 0-100>,
  "verdict": "safe" | "suspicious" | "dangerous",
  "flags": [<массив строк — конкретные признаки мошенничества из текста, на русском, максимум 7>],
  "summary": "<1-2 предложения объяснения на русском>",
  "tips": [<3-5 конкретных совета для пользователя на русском>]
}

Текст для анализа:
"""
${text}
"""`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.05, maxOutputTokens: 1200 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${resp.status}`);
  }

  const data = await resp.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Извлекаем JSON даже если Gemini обернул его в ```json ... ```
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini вернул неверный формат ответа');

  const parsed = JSON.parse(jsonMatch[0]);
  return convertGeminiResult(parsed);
}

/* -------- Конвертация ответа Gemini в формат showResult -------- */
function convertGeminiResult(g) {
  const pct = Math.min(Math.max(Number(g.threatPercent) || 0, 0), 98);
  let level, icon, cardClass, levelClass, tips;

  if (pct >= 50 || g.verdict === 'dangerous') {
    level = '🔴 ВЫСОКАЯ УГРОЗА — МОШЕННИЧЕСТВО'; icon = '🚨';
    cardClass = 'danger-card'; levelClass = 'danger-level';
    tips = g.tips?.length ? g.tips : TIPS_BY_CATEGORY.high;
  } else if (pct >= 20 || g.verdict === 'suspicious') {
    level = '🟡 ПОДОЗРИТЕЛЬНО — ПРОВЕРЬТЕ ПЕРЕД ДЕЙСТВИЕМ'; icon = '⚠️';
    cardClass = 'warning-card'; levelClass = 'warning-level';
    tips = g.tips?.length ? g.tips : TIPS_BY_CATEGORY.medium;
  } else {
    level = '🟢 ПРИЗНАКОВ УГРОЗЫ НЕ НАЙДЕНО'; icon = '✅';
    cardClass = 'safe-card'; levelClass = 'safe-level';
    tips = g.tips?.length ? g.tips : TIPS_BY_CATEGORY.safe;
  }

  return {
    threatPct: pct, level, icon, cardClass, levelClass,
    summary: g.summary || '',
    flags: g.flags || [],
    tips,
    isGemini: true,
  };
}

/* ========================================================
   DEMO TEXTS
   ======================================================== */
const DEMOS = [
  // 0 – Фишинг
  `Уважаемый клиент! Ваш аккаунт Беларусбанка заблокирован из-за подозрительной активности. Для разблокировки немедленно перейдите: http://belarusbank-secure-id.com/verify и подтвердите данные карты. Код подтверждения придёт в SMS — введите его на сайте. Аккаунт будет удалён через 2 часа!`,
  // 1 – Банк / Вишинг (купоны из оборота — конкретный случай из скриншота)
  `Вас беспокоит Беларусбанк. Выпущены в оборот новые купоны в 1000 рублей, в связи с чем старые снимаются из оборота. Если у вас есть такие купоны, вам необходимо их обменять до конца текущей недели. Обмен осуществляется через специальные банкоматы. Назовите ваше местоположение, и я уточню ближайший. Также продиктуйте нам код который пришёл вам в смс — это нужно для верификации.`,
  // 2 – Приз
  `Поздравляем! Вы стали победителем акции Wildberries BY! Вам положен iPhone 15 Pro. Для получения приза оплатите стоимость доставки (9.90 Br) на сайте: wildberries-prize-by.ru Акция действует строго 24 часа!`,
  // 3 – Звонок / «на вас кредит»
  `На вас оформляется кредит на сумму 25 000 рублей в МТБ-Банке. Чтобы немедленно остановить операцию, вам необходимо перевести ваши средства на защищённый счёт Национального банка. Назовите код из SMS и данные вашей карты — мы заблокируем транзакцию.`,
  // 4 – Безопасный
  `Привет! Завтра встречаемся в 18:00 у кафе на Независимости. Маша тоже придёт. Не опаздывай! Если что — звони мне.`,
  // 5 – Куфар
  `Добрый день! Я хочу купить ваш велосипед с Куфара. Я нахожусь в другом городе, поэтому предлагаю безопасную сделку — отправлю деньги через курьерскую службу. Для получения оплаты перейдите по ссылке и введите данные карты: http://kufar-safe-deal.ru/pay?id=8812`,
];

document.getElementById('scan-input').addEventListener('input', function () {
  document.getElementById('char-counter').textContent = `${this.value.length} / 1000`;
});

function loadDemo(idx) {
  const ta = document.getElementById('scan-input');
  ta.value = DEMOS[idx] || '';
  document.getElementById('char-counter').textContent = `${ta.value.length} / 1000`;
  ta.focus();
}

function clearScan() {
  document.getElementById('scan-input').value = '';
  document.getElementById('char-counter').textContent = '0 / 1000';
  resetResultArea();
}

/* ========================================================
   НЕЙРОННАЯ СЕТЬ (Canvas)
   ======================================================== */
(function initNeuralCanvas() {
  const canvas = document.getElementById('neural-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], mouse = { x: -9999, y: -9999 };
  const NODES = 60, CONN = 140, MDIST = 180;

  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  function createNodes() {
    nodes = [];
    for (let i = 0; i < NODES; i++)
      nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, r: Math.random() * 2.5 + 1, pulse: Math.random() * Math.PI * 2 });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < CONN) { ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.strokeStyle = `rgba(0,212,255,${(1 - d / CONN) * .35})`; ctx.lineWidth = .7; ctx.stroke(); }
    }
    nodes.forEach(n => {
      const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < MDIST) { ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(mouse.x, mouse.y); ctx.strokeStyle = `rgba(123,47,255,${(1 - d / MDIST) * .6})`; ctx.lineWidth = 1; ctx.stroke(); }
    });
    nodes.forEach(n => {
      n.pulse += .04;
      const g = .5 + .5 * Math.sin(n.pulse);
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r + g, 0, Math.PI * 2); ctx.fillStyle = `rgba(0,212,255,${.4 + .4 * g})`; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r * .5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fill();
    });
  }
  function update() {
    nodes.forEach(n => { n.x += n.vx; n.y += n.vy; if (n.x < 0 || n.x > W) n.vx *= -1; if (n.y < 0 || n.y > H) n.vy *= -1; });
  }
  function loop() { update(); draw(); requestAnimationFrame(loop); }
  window.addEventListener('resize', () => { resize(); createNodes(); });
  window.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  resize(); createNodes(); loop();
})();

/* ========================================================
   ЛОКАЛЬНЫЙ АНАЛИЗАТОР (резервный, если нет Gemini ключа)
   ======================================================== */
const THREAT_RULES = [
  { id: 'suspicious_url', weight: 30, flag: '🔗 Подозрительная внешняя ссылка — домен не совпадает с официальным сайтом', check: t => /https?:\/\/[^\s]{4,}/i.test(t) && !/https?:\/\/(?:www\.)?(belarusbank\.by|priorbank\.by|nbrb\.by|mvd\.gov\.by|portal\.gov\.by|bsb\.by|alfabank\.by|mtbbank\.by|cert\.by|1k\.by|onliner\.by|kufar\.by)([/?#]|$)/i.test(t) },
  { id: 'shortened_url', weight: 25, flag: '🔗 Сокращённая ссылка скрывает настоящий адрес — приём фишеров', check: t => /bit\.ly|tinyurl|goo\.gl|t\.co|ow\.ly|cutt\.ly|rb\.gy|clck\.ru|vk\.cc/i.test(t) },
  { id: 'fake_domain', weight: 28, flag: '🌐 Поддельный домен содержит слова «secure», «verify», «prize»', check: t => /[a-z0-9-]*(secure|safe|login|verify|id|prize|cancel|bank|pay|lk|cabinet|account|online)[a-z0-9-]*\.(ru|com|net|org|by|info|site|xyz)/i.test(t) && !/https?:\/\/(?:www\.)?(belarusbank|priorbank|nbrb|mvd\.gov|portal\.gov)\.by/i.test(t) },
  { id: 'urgency', weight: 20, flag: '⏰ Искусственная срочность — давление для принятия быстрого решения', check: t => /(срочно|немедленно|через\s*\d+\s*(час|минут|дн)|торопитесь|заблокир|удаляется|истекает|последний шанс|сейчас же|незамедлительно)/i.test(t) },
  { id: 'prize_scam', weight: 25, flag: '🎁 Ложный выигрыш — банки и магазины не сообщают о призах через ссылки', check: t => /(выиграли|победитель\b|розыгрыш|вам положен|вам начислен|вы стали победител|вам полагается|вы выбраны)/i.test(t) },
  { id: 'card_data_request', weight: 42, flag: '💳 Запрос данных карты — банки никогда не просят CVV через сообщения', check: t => /(данные.{0,35}карт|карт.{0,35}данные|номер.{0,25}карт|cvv|cvc\b|пин.?код|введ.{0,30}(карт|реквизит)|реквизит.{0,30}карт|нужн.{0,25}данные.{0,25}карт)/i.test(t) },
  { id: 'sms_code_request', weight: 45, flag: '📱 Запрос SMS-кода — банки и госорганы НИКОГДА не просят называть коды', check: t => /(код\s*из\s*sms|код\s*из\s*смс|смс.{0,5}код|продиктуй.{0,50}код|назов.{0,35}код|перешли.{0,30}код|код.{0,35}пришёл|пришёл.{0,35}код|скажите\s+код)/i.test(t) },
  { id: 'impersonate_bank', weight: 35, flag: '🏦 Имитация банка — входящие «тревожные» звонки от «банка» почти всегда мошенничество', check: t => /(беларусбанк|приорбанк|белагропром|бпс.?банк|альфа.банк|мтб.?банк|служба\s*безопасности\s*банк|сотрудник.{0,20}банк)/i.test(t) && /(блокировк|мошенник|операц|подозрит|верифик|подтвержд|кредит|перевод|остановить)/i.test(t) },
  { id: 'impersonate_auth', weight: 40, flag: '👮 Имитация госорганов — МВД/КГБ/нотариус не требуют данные карты в мессенджерах', check: t => /(следовател|прокурор|\bмвд\b|полиц|кгб|следственн|инспектор|нотариус)/i.test(t) && /(уголовн|дело|задержан|арест|штраф|перевод|счёт|карт|данные|наследств)/i.test(t) },
  { id: 'safe_account', weight: 45, flag: '🏧 «Безопасный счёт» — главная легенда белорусских мошенников в 2024–2025', check: t => /(защищённый\s*счёт|безопасный\s*счёт|резервный\s*счёт|счёт\s*национального\s*банка|страховой\s*счёт|технический\s*счёт)/i.test(t) },
  { id: 'credit_fraud', weight: 35, flag: '💳 «На вас оформляется кредит» — популярная легенда вишинга в Беларуси', check: t => /(оформля.{0,25}кредит|кредит.{0,25}оформ|на вас.{0,20}кредит|займ.{0,25}оформ|микрозайм)/i.test(t) },
  { id: 'delivery_fee', weight: 35, flag: '📦 «Оплата доставки приза» — стандартная схема кражи данных карты', check: t => /(оплата.{0,25}доставк|оплатить.{0,25}доставк|стоимость.{0,25}доставк|внесите.{0,30}за\s*доставк)/i.test(t) },
  { id: 'investment_fraud', weight: 40, flag: '💰 «Гарантированный доход» — инвестиционное мошенничество', check: t => /(гарантир.{0,25}(доход|прибыл|процент)|пассивн.{0,20}доход|крипто.?бот|\d{2,3}\s*%\s*в\s*(месяц|неделю)|заработ.{0,25}без\s*(опыт|риск)|вложи.{0,25}получай)/i.test(t) },
  { id: 'remote_access', weight: 45, flag: '💻 Просьба установить программу — мошенники получат контроль над устройством', check: t => /(anydesk|teamviewer|удалённ.{0,25}доступ|скачай.{0,30}(приложен|программ)|дай\s*доступ|предоставь\s*доступ)/i.test(t) },
  { id: 'personal_data', weight: 38, flag: '🪪 Запрос паспортных данных — легальные организации не делают это через мессенджеры', check: t => /(паспортные\s*данные|серия.{0,15}номер.{0,15}паспорт|идентификационн.{0,20}(код|номер)|пришлите.{0,10}(скан|фото).{0,25}паспорт)/i.test(t) },
  { id: 'marketplace_fraud', weight: 40, flag: '🛒 «Безопасная сделка» на Куфар — мошенники создают поддельные страницы оплаты', check: t => /(kufar|куфар).{0,100}(оплат|карт|перевод|ссылк|безопасн.{0,20}сделк)|безопасн.{0,25}сделк.{0,100}(kufar|куфар)/i.test(t) },
  { id: 'inheritance_scam', weight: 45, flag: '🏛️ «Наследство от родственника» — классическое мошенничество для получения данных карты', check: t => /(наследств|наследник|завещани|нотариальн).{0,250}(карт|данные|перевод|счёт|сумм|деньг)/i.test(t) || (/(карт|данные|перевод|сумм|деньг).{0,250}(наследств|наследник|завещани)/i.test(t)) },
  { id: 'romance_scam', weight: 38, flag: '❤️ Романтическое мошенничество — просьбы о деньгах от виртуальных знакомых', check: t => /(познакомил.{0,200}(деньг|перевод|карт|срочно))|(застрял|задержан|авария|больниц).{0,200}(деньг|перевод|перевести|пришли)/i.test(t) },
  { id: 'money_request', weight: 28, flag: '💸 Прямая просьба о переводе денег — убедитесь, что знаете отправителя лично', check: t => /(переведи.{0,50}(рублей|руб\.|br\b|деньг)|пришли.{0,50}(рублей|br\b|деньг)|скинь.{0,40}(рублей|br\b|деньг)|отправь.{0,50}на карт)/i.test(t) },
  { id: 'social_engineering', weight: 32, flag: '🧠 Психологическое давление — страх потери денег как главный манипулятивный приём', check: t => /(ваш.{0,20}(счёт|карт|средств|деньг).{0,40}(под угрозой|в опасности|заморожен|арестован)|несанкционирован.{0,25}(доступ|операц|вход))/i.test(t) },
  { id: 'credential_phishing', weight: 38, flag: '🔑 Запрос логина и пароля — легальные сервисы никогда не просят пароль через сообщение', check: t => /(введите.{0,30}(логин|пароль)|логин.{0,20}и.{0,20}пароль|данные.{0,25}(аккаунт|учётн|личн.{0,10}кабинет))/i.test(t) },
  // Дополнительные правила (купоны, «изъятие из оборота» и т.п.)
  { id: 'currency_swap_scam', weight: 38, flag: '💵 «Обмен купонов / старых банкнот» — фиктивная смена валюты для выманивания данных', check: t => /(купон.{0,80}(обмен|изъят|снимают|обменять|сдать)|банкнот.{0,80}(изъят|обмен|сдать)|старые.{0,40}(купон|банкнот|рубл).{0,80}(обмен|изъят))/i.test(t) },
  { id: 'location_request', weight: 22, flag: '📍 Запрос вашего местоположения — незнакомые лица не должны знать, где вы находитесь', check: t => /(назовите.{0,30}(ваш.{0,15}(адрес|местополож|город|улиц))|сообщите.{0,30}(ваш.{0,15}(адрес|местополож))|уточнить.{0,30}(ваш.{0,15}(адрес|местополож)))/i.test(t) },
];

const TIPS_BY_CATEGORY = {
  high: [
    '🚫 Не переходи по ссылкам из этого сообщения ни при каких обстоятельствах',
    '📞 Позвони напрямую в организацию по номеру с официального сайта — не по номеру из сообщения',
    '🔒 Никогда не называй SMS-коды, CVV-код карты, пароли или паспортные данные по чужой просьбе',
    '🗑️ Удали это сообщение и заблокируй отправителя',
    '👮 Сообщи о мошенничестве: МВД Беларуси — 102, сайт mvd.gov.by / hotline\\.cert\\.by',
  ],
  medium: [
    '🔍 Открой официальный сайт организации вручную в браузере — не по ссылке из сообщения',
    '⏸️ Не принимай решений под давлением — возьми паузу минимум на 30 минут',
    '📞 Перезвони отправителю на заранее известный тебе номер для уточнения',
    '🔎 Поищи точную формулировку сообщения в Google — мошеннические схемы часто уже известны',
    '👨‍👩‍👧 Посоветуйся с близкими перед любыми переводами или сообщением данных',
  ],
  safe: [
    '✅ Явных признаков мошенничества не обнаружено — сообщение выглядит безопасным',
    '🛡️ Сохраняй бдительность: всегда проверяй просьбы о переводе денег или передаче данных',
    '💡 Расскажи близким о НейроЩифте — знание защищает лучше любого замка',
  ],
};

/* -------- Локальный анализ -------- */
function analyzeTextLocal(text) {
  let total = 0;
  const flags = [];
  THREAT_RULES.forEach(r => { if (r.check(text)) { total += r.weight; flags.push(r.flag); } });

  let pct;
  if (total === 0) pct = 0;
  else if (flags.length === 1) pct = Math.round(12 + (total / 45) * 33);
  else pct = Math.min(Math.round((total / 105) * 100), 98);

  let level, icon, cardClass, levelClass, tips;
  if (pct >= 48) {
    level = '🔴 ВЫСОКАЯ УГРОЗА — МОШЕННИЧЕСТВО'; icon = '🚨'; cardClass = 'danger-card'; levelClass = 'danger-level';
    tips = TIPS_BY_CATEGORY.high;
    const n = flags.length;
    return {
      threatPct: pct, level, icon, cardClass, levelClass, tips, flags, isGemini: false,
      summary: `Система обнаружила ${n} критических признаков мошенничества. Не предпринимайте никаких действий, предлагаемых отправителем.`
    };
  } else if (pct >= 18) {
    level = '🟡 ПОДОЗРИТЕЛЬНО — ПРОВЕРЬТЕ ПЕРЕД ДЕЙСТВИЕМ'; icon = '⚠️'; cardClass = 'warning-card'; levelClass = 'warning-level';
    tips = TIPS_BY_CATEGORY.medium;
    return {
      threatPct: pct, level, icon, cardClass, levelClass, tips, flags, isGemini: false,
      summary: `Обнаружено ${flags.length} подозрительных признаков. Проверьте сообщение перед любыми действиями. Мошенники создают ощущение срочности — не спешите.`
    };
  } else {
    level = '🟢 ПРИЗНАКОВ УГРОЗЫ НЕ НАЙДЕНО'; icon = '✅'; cardClass = 'safe-card'; levelClass = 'safe-level';
    tips = TIPS_BY_CATEGORY.safe;
    return {
      threatPct: pct, level, icon, cardClass, levelClass, tips, flags, isGemini: false,
      summary: 'Система не обнаружила явных признаков мошенничества. Сохраняйте бдительность — если что-то кажется странным, доверяйте интуиции.'
    };
  }
}

/* ========================================================
   СКАНИРОВАНИЕ
   ======================================================== */
const SCAN_STEPS_LOCAL = [
  'Анализирую синтаксис текста...',
  'Проверяю URL и домены...',
  'Сравниваю с базой угроз Беларуси...',
  'Анализирую психологические триггеры...',
  'Проверяю паттерны мошенничества...',
  'Формирую заключение...',
];

const SCAN_STEPS_GEMINI = [
  'Отправка запроса в Gemini AI...',
  'Нейросеть анализирует контекст...',
  'Выявление скрытых манипуляций...',
  'Оценка психологического давления...',
  'Сравнение с базой мошеннических схем...',
  'Gemini формирует заключение...',
  'Получение результата...',
];

function resetResultArea() {
  const ra = document.getElementById('result-area');
  ra.innerHTML = `
    <div class="scanning-state" id="scanning-state" style="display:none;">
      <div class="scan-animation">
        <div class="scan-ring ring1"></div>
        <div class="scan-ring ring2"></div>
        <div class="scan-ring ring3"></div>
        <div class="scan-core">◈</div>
      </div>
      <div class="scan-progress-bar"><div class="scan-progress-fill" id="scan-progress-fill"></div></div>
      <div class="scan-status-text" id="scan-status-text">Инициализация...</div>
    </div>
    <div class="result-state" id="result-state" style="display:none;">
      <div class="verdict-card" id="verdict-card">
        <div id="result-source-row"></div>
        <div class="verdict-header">
          <div class="verdict-icon" id="verdict-icon">⚠</div>
          <div class="verdict-info">
            <div class="verdict-label">ВЕРДИКТ СИСТЕМЫ</div>
            <div class="verdict-level" id="verdict-level">Анализ...</div>
          </div>
          <div class="threat-meter">
            <div class="threat-label">Угроза</div>
            <div class="threat-arc-wrap">
              <svg viewBox="0 0 100 60" class="threat-arc-svg">
                <path d="M10,55 A45,45 0 0,1 90,55" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8" stroke-linecap="round"/>
                <path id="threat-arc" d="M10,55 A45,45 0 0,1 90,55" fill="none" stroke="#00d4ff" stroke-width="8" stroke-linecap="round" stroke-dasharray="0 141"/>
              </svg>
              <div class="threat-percent" id="threat-percent">0%</div>
            </div>
          </div>
        </div>
        <div class="verdict-summary" id="verdict-summary"></div>
        <div class="flags-section" id="flags-section">
          <div class="flags-title">🚩 Обнаруженные красные флаги</div>
          <div class="flags-list" id="flags-list"></div>
        </div>
        <div class="tips-section" id="tips-section">
          <div class="tips-title">🛡️ Как защититься</div>
          <div class="tips-list" id="tips-list"></div>
        </div>
        <button class="btn-secondary rescan-btn" onclick="resetScan()">← Сканировать снова</button>
      </div>
    </div>`;
}

async function startScan() {
  const text = document.getElementById('scan-input').value.trim();
  if (!text) {
    const ta = document.getElementById('scan-input');
    ta.focus();
    ta.style.borderColor = 'rgba(255,56,96,0.6)';
    setTimeout(() => { ta.style.borderColor = ''; }, 1500);
    return;
  }

  resetResultArea();
  const scanBtn = document.getElementById('btn-scan');
  scanBtn.disabled = true;

  const scanningEl = document.getElementById('scanning-state');
  const resultEl = document.getElementById('result-state');
  scanningEl.style.display = 'flex';
  resultEl.style.display = 'none';

  const fillEl = document.getElementById('scan-progress-fill');
  const statusEl = document.getElementById('scan-status-text');

  const apiKey = getGeminiKey();
  const steps = apiKey ? SCAN_STEPS_GEMINI : SCAN_STEPS_LOCAL;

  // Прогресс-бар анимация (параллельно с запросом)
  let stepIdx = 0;
  const intervalMs = apiKey ? 550 : 360;
  const progressInterval = setInterval(() => {
    if (stepIdx < steps.length) {
      statusEl.textContent = steps[stepIdx];
      fillEl.style.width = Math.round(((stepIdx + 1) / steps.length) * 90) + '%';
      stepIdx++;
    }
  }, intervalMs);

  let result;
  try {
    if (apiKey) {
      result = await callGeminiAPI(text, apiKey);
    } else {
      await new Promise(r => setTimeout(r, steps.length * intervalMs + 100));
      result = analyzeTextLocal(text);
    }
  } catch (err) {
    console.warn('Gemini API ошибка:', err.message);
    // Фолбэк на локальный анализатор
    result = analyzeTextLocal(text);
    result.geminiError = err.message;
  }

  clearInterval(progressInterval);
  fillEl.style.width = '100%';
  statusEl.textContent = 'Анализ завершён.';

  setTimeout(() => {
    scanningEl.style.display = 'none';
    showResult(result);
    scanBtn.disabled = false;
  }, 350);
}

function showResult(result) {
  const resultEl = document.getElementById('result-state');
  resultEl.style.display = 'block';

  const card = document.getElementById('verdict-card');
  card.className = `verdict-card ${result.cardClass} fade-in`;

  // Бейдж источника анализа
  const srcRow = document.getElementById('result-source-row');
  if (result.isGemini) {
    srcRow.innerHTML = '<div class="result-source-badge">◈ ANALYSED BY GEMINI 2.0 FLASH</div>';
  } else {
    const err = result.geminiError ? ` (${result.geminiError.slice(0, 60)})` : '';
    srcRow.innerHTML = `<div class="result-source-badge local-badge">◇ ЛОКАЛЬНЫЙ АНАЛИЗАТОР${err ? ' · GEMINI НЕДОСТУПЕН' : ''}</div>`;
  }

  document.getElementById('verdict-icon').textContent = result.icon;
  document.getElementById('verdict-level').textContent = result.level;
  document.getElementById('verdict-level').className = `verdict-level ${result.levelClass}`;
  document.getElementById('verdict-summary').textContent = result.summary;

  animateThreatArc(result.threatPct, result.cardClass);

  const flagsList = document.getElementById('flags-list');
  const flagsSection = document.getElementById('flags-section');
  flagsList.innerHTML = '';
  if (!result.flags?.length) {
    flagsSection.style.display = 'none';
  } else {
    flagsSection.style.display = 'block';
    result.flags.forEach((flag, i) => {
      const el = document.createElement('div');
      el.className = 'flag-item';
      el.style.animationDelay = `${i * 100}ms`;
      el.innerHTML = `<span class="fi-icon">🚩</span><span>${flag}</span>`;
      flagsList.appendChild(el);
    });
  }

  const tipsList = document.getElementById('tips-list');
  tipsList.innerHTML = '';
  (result.tips || []).forEach((tip, i) => {
    const el = document.createElement('div');
    el.className = 'tip-item';
    el.style.animationDelay = `${i * 80}ms`;
    el.innerHTML = `<span class="ti-icon">→</span><span>${tip}</span>`;
    tipsList.appendChild(el);
  });

  resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function animateThreatArc(pct, cardClass) {
  const arc = document.getElementById('threat-arc');
  const pctEl = document.getElementById('threat-percent');
  const total = 141;
  let color = '#00e676';
  if (cardClass === 'danger-card') color = '#ff3860';
  else if (cardClass === 'warning-card') color = '#ffb700';
  arc.style.stroke = color;
  pctEl.style.color = color;

  let cur = 0;
  const target = (pct / 100) * total;
  const step = Math.max(target / 40, 0.5);
  const anim = setInterval(() => {
    cur = Math.min(cur + step, target);
    arc.style.strokeDasharray = `${cur} ${total}`;
    pctEl.textContent = Math.round((cur / total) * 100) + '%';
    if (cur >= target) clearInterval(anim);
  }, 20);
}

function resetScan() {
  resetResultArea();
  ['scanning-state', 'result-state'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.getElementById('btn-scan').disabled = false;
  document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' });
}

/* ========================================================
   СЧЁТЧИКИ СТАТИСТИКИ
   ======================================================== */
const STAT_TARGETS = [27000, 50, 97, 3, 1, 15];
const STAT_SUFFIXES = ['+', 'М+ Br', '%', ' мин', ' из 4', ' сек'];

function animateCounter(el, target, suffix) {
  const dur = 2000, start = performance.now();
  (function update(now) {
    const t = Math.min(now - start, dur);
    const v = Math.round((1 - Math.pow(1 - t / dur, 3)) * target);
    el.textContent = target >= 1000 ? Math.round(v / 1000) + 'К' + suffix : v + suffix;
    if (t < dur) requestAnimationFrame(update);
    else el.textContent = target >= 1000 ? Math.round(target / 1000) + 'К' + suffix : target + suffix;
  })(start);
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.stat-card').forEach((_, i) => {
        const el = document.getElementById(`sc-${i}`);
        if (el && !el.dataset.animated) { el.dataset.animated = '1'; animateCounter(el, STAT_TARGETS[i], STAT_SUFFIXES[i]); }
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });
const statsSection = document.getElementById('stats');
if (statsSection) statsObserver.observe(statsSection);

/* ========================================================
   КВИЗ
   ======================================================== */
const QUESTIONS = [
  {
    q: 'Тебе приходит SMS: «БЕЛАРУСБАНК: Ваша карта заблокирована. Для разблокировки перейдите: http://belarusbank-unblock.com». Что делать?',
    options: ['Перейти по ссылке и ввести данные карты', 'Позвонить в банк по номеру на обороте карты или с официального сайта', 'Переслать SMS другу, чтобы он проверил', 'Ответить на SMS с просьбой объяснить ситуацию'],
    correct: 1,
    feedback: '✅ Верно! Банк никогда не блокирует карту через SMS-ссылки. Домен «belarusbank-unblock.com» — поддельный. Звони по официальному номеру на обороте карты.',
    wrongFeedback: '❌ Опасно! Никогда не переходи по ссылкам из SMS о блокировке карты. Позвони в банк по номеру с официального сайта.',
  },
  {
    q: '«Сотрудник службы безопасности Беларусбанка» говорит, что на вас оформляется кредит, и просит назвать код из SMS. Ты...',
    options: ['Называешь код — надо же остановить кредит!', 'Кладёшь трубку и перезваниваешь в банк самостоятельно по номеру с карты', 'Просишь подождать и советуешься с родственниками', 'Соглашаешься перевести деньги на «защищённый счёт»'],
    correct: 1,
    feedback: '✅ Правильно! SMS-код — это ключ от твоего счёта. Настоящий банк НИКОГДА не просит его называть. Положи трубку и звони сам.',
    wrongFeedback: '❌ Неверно! Назвать SMS-код = отдать доступ к счёту мошенникам. Клади трубку и звони в банк самому по официальному номеру.',
  },
  {
    q: 'На Куфаре покупатель предлагает перевести оплату через «безопасную сделку» и присылает ссылку в чат. Что это?',
    options: ['Легальная функция Куфара — всё нормально', 'Вероятно мошенничество — Куфар не рассылает ссылки в чат', 'Стандартная схема для крупных сделок', 'Защита покупателя — можно вводить данные карты'],
    correct: 1,
    feedback: '✅ Отлично! Настоящий Куфар не присылает ссылки в личные чаты. Открывай сайт вручную: kufar.by.',
    wrongFeedback: '❌ Это мошенничество! Мошенники создают точные копии страниц Куфара. Введя данные карты, потеряешь деньги.',
  },
  {
    q: 'Незнакомец в Telegram предлагает «крипто-бот» с гарантированным доходом 40% в месяц. Это...',
    options: ['Легальная инвестиция — договор защитит деньги', 'Мошенничество — законные инвестиции не гарантируют доходность', 'Стартап — нужно торопиться, пока не закрыли', 'Нормально, если у них хорошие отзывы в Telegram'],
    correct: 1,
    feedback: '✅ Правильно! 40% в месяц = 480% годовых. Такого не существует в легальной экономике.',
    wrongFeedback: '❌ Гарантированная доходность — главный признак мошенничества. Отзывы в Telegram легко сфальсифицировать.',
  },
  {
    q: 'Получаешь письмо якобы от Портала Госуслуг РБ: «Вам доступна выплата 480 руб. Войдите: portal-gov-rb-vyplata.com». Что делаешь?',
    options: ['Перехожу по ссылке — звучит убедительно', 'Открываю официальный сайт portal.gov.by вручную и проверяю', 'Ввожу логин — ссылка похожа на настоящую', 'Пересылаю друзьям, пусть тоже получат'],
    correct: 1,
    feedback: '✅ Правильно! Официальный адрес — portal.gov.by. «portal-gov-rb-vyplata.com» — подделка. Всегда вводи адрес вручную в браузере.',
    wrongFeedback: '❌ Фишинг! Введя данные, отдашь логин мошенникам. Официальный адрес Портала государственных услуг: portal.gov.by.',
  },
];

let currentQuestion = 0, score = 0, answered = false;

function startQuiz() {
  currentQuestion = 0; score = 0; answered = false;
  document.getElementById('quiz-start').style.display = 'none';
  document.getElementById('quiz-question-screen').style.display = 'block';
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[currentQuestion];
  answered = false;
  document.getElementById('quiz-qnum').textContent = `Вопрос ${currentQuestion + 1} из ${QUESTIONS.length}`;
  document.getElementById('quiz-question').textContent = q.q;
  document.getElementById('quiz-progress-fill').style.width = `${(currentQuestion / QUESTIONS.length) * 100}%`;
  const fb = document.getElementById('quiz-feedback');
  fb.style.display = 'none'; fb.textContent = '';
  const opts = document.getElementById('quiz-options');
  opts.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option'; btn.textContent = opt; btn.id = `qopt-${i}`;
    btn.addEventListener('click', () => selectOption(i));
    opts.appendChild(btn);
  });
}

function selectOption(chosen) {
  if (answered) return;
  answered = true;
  const q = QUESTIONS[currentQuestion];
  const ok = chosen === q.correct;
  if (ok) score++;
  document.querySelectorAll('.quiz-option').forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('correct');
    else if (i === chosen && !ok) btn.classList.add('wrong');
  });
  const fb = document.getElementById('quiz-feedback');
  fb.style.display = 'block';
  fb.className = `quiz-feedback ${ok ? 'correct-fb' : 'wrong-fb'}`;
  fb.textContent = ok ? q.feedback : q.wrongFeedback;
  setTimeout(nextQuestion, 2500);
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < QUESTIONS.length) renderQuestion();
  else showQuizResult();
}

function showQuizResult() {
  document.getElementById('quiz-progress-fill').style.width = '100%';
  document.getElementById('quiz-question-screen').style.display = 'none';
  document.getElementById('quiz-result-screen').style.display = 'flex';
  const pct = score / QUESTIONS.length;
  let rank, icon, desc;
  if (pct === 1) { rank = 'ЛЕГЕНДА КИБЕРБЕЗОПАСНОСТИ'; icon = '🏆'; desc = 'Феноменально! Все вопросы правильно. Расскажи о НейроЩифте — вместе мы безопаснее!'; }
  else if (pct >= 0.8) { rank = 'СТРАЖ ЦИФРОВОГО МИРА'; icon = '🛡️'; desc = 'Отлично! Изучи Базу угроз, чтобы закрыть последние пробелы.'; }
  else if (pct >= 0.6) { rank = 'АГЕНТ КИБЕРПРАВА'; icon = '🔍'; desc = 'Хороший старт! Мошенники постоянно изобретают новые схемы. Изучи «Досье угроз».'; }
  else if (pct >= 0.4) { rank = 'НОВОБРАНЕЦ'; icon = '📡'; desc = 'Есть опасные пробелы. Именно их используют мошенники. Изучи «Досье угроз» и попробуй ещё раз!'; }
  else { rank = 'ПОД УГРОЗОЙ'; icon = '⚠️'; desc = 'Ты сделал главный шаг — попробовал! Прочитай «Досье угроз» — это может спасти тебя или близких.'; }
  document.getElementById('result-rank-icon').textContent = icon;
  document.getElementById('result-rank-title').textContent = rank;
  document.getElementById('result-score').textContent = `${score} из ${QUESTIONS.length} правильных ответов`;
  document.getElementById('result-desc').textContent = desc;
}

function restartQuiz() {
  document.getElementById('quiz-result-screen').style.display = 'none';
  document.getElementById('quiz-question-screen').style.display = 'none';
  document.getElementById('quiz-start').style.display = 'flex';
  currentQuestion = 0; score = 0; answered = false;
}

/* ========================================================
   SCROLL FADE-IN АНИМАЦИИ
   ======================================================== */
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.stat-card, .flip-card, .section-title, .section-desc').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  fadeObserver.observe(el);
});
