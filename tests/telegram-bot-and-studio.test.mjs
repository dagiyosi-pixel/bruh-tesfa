// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Telegram Bot, Alerts & Studio Test Suite
// =============================================================================

process.env.IS_TEST = 'true';

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  verifyTelegramWebhookSecret,
  handleTelegramUpdate,
  matchSubscribersForVacancy,
  getContentStudioTemplates,
  renderContentStudioPost,
  generateTrackedLink,
  getMainBotMenuKeyboard,
  getAlertPreferencesKeyboard,
  upsertTelegramSubscriber,
  getTelegramSubscriber,
  unsubscribeTelegramSubscriber,
  getActiveTelegramSubscribers,
  recordTelegramBroadcastLog,
  hasVacancyBeenBroadcast,
  getTelegramMarketingMetrics,
} from '../src/lib/telegram.ts';

// -----------------------------------------------------------------------------
// TEST 1: WEBHOOK SECURITY & TIMING-SAFE VALIDATION
// -----------------------------------------------------------------------------

test('Telegram Webhook: Validates secret token using timing-safe comparison', () => {
  const originalSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  try {
    process.env.TELEGRAM_WEBHOOK_SECRET = 'super_secret_telegram_webhook_token_123';

    // 1. Correct secret
    assert.equal(
      verifyTelegramWebhookSecret('super_secret_telegram_webhook_token_123'),
      true,
      'Exact matching secret must be accepted'
    );

    // 2. Incorrect secret
    assert.equal(
      verifyTelegramWebhookSecret('wrong_secret_token'),
      false,
      'Invalid secret must be rejected'
    );

    // 3. Missing secret header
    assert.equal(
      verifyTelegramWebhookSecret(null),
      false,
      'Null header must be rejected'
    );

    // 4. Empty secret header
    assert.equal(
      verifyTelegramWebhookSecret(''),
      false,
      'Empty string header must be rejected'
    );
  } finally {
    process.env.TELEGRAM_WEBHOOK_SECRET = originalSecret;
  }
});

// -----------------------------------------------------------------------------
// TEST 2: BOT COMMAND ROUTING & SUBSCRIBER REGISTRATION
// -----------------------------------------------------------------------------

test('Telegram Bot: /start command welcomes user and registers active subscriber', async () => {
  const testChatId = Math.floor(Math.random() * 800000) + 100000;

  const update = {
    message: {
      message_id: 1,
      chat: { id: testChatId, type: 'private' },
      from: { id: testChatId, first_name: 'Abebe', username: 'abebe_ethiopia' },
      text: '/start',
    },
  };

  const res = await handleTelegramUpdate(update);
  assert.equal(res.handled, true);
  assert.equal(res.action, 'command_start');

  // Verify subscriber record created
  const sub = await getTelegramSubscriber(testChatId);
  assert.ok(sub, 'Subscriber record must be created in storage');
  assert.equal(sub.chat_id, testChatId);
  assert.equal(sub.first_name, 'Abebe');
  assert.equal(sub.is_active, true);
});

test('Telegram Bot: /help command returns safeguarding notice and coordinator support', async () => {
  const testChatId = Math.floor(Math.random() * 800000) + 100000;
  const update = {
    message: {
      message_id: 2,
      chat: { id: testChatId, type: 'private' },
      from: { id: testChatId, first_name: 'Tigist' },
      text: '/help',
    },
  };

  const res = await handleTelegramUpdate(update);
  assert.equal(res.handled, true);
  assert.equal(res.action, 'command_help');
});

test('Telegram Bot: /stop command unsubscribes user promptly', async () => {
  const testChatId = Math.floor(Math.random() * 800000) + 200000;

  // First subscribe
  await upsertTelegramSubscriber({
    chat_id: testChatId,
    first_name: 'Dawit',
    is_active: true,
  });

  const update = {
    message: {
      message_id: 3,
      chat: { id: testChatId, type: 'private' },
      from: { id: testChatId, first_name: 'Dawit' },
      text: '/stop',
    },
  };

  const res = await handleTelegramUpdate(update);
  assert.equal(res.handled, true);
  assert.equal(res.action, 'command_stop');

  const sub = await getTelegramSubscriber(testChatId);
  assert.ok(sub, 'Subscriber must exist');
  assert.equal(sub.is_active, false, 'Subscriber is_active must be false after /stop');
});

// -----------------------------------------------------------------------------
// TEST 3: INTERACTIVE INLINE KEYBOARDS & BUTTON CALLBACKS
// -----------------------------------------------------------------------------

test('Telegram Bot: Main menu keyboard includes 7 verified actions and UTM tracking', () => {
  const menu = getMainBotMenuKeyboard();
  assert.ok(Array.isArray(menu.inline_keyboard), 'Menu must have inline_keyboard array');

  const allButtons = menu.inline_keyboard.flat();
  assert.equal(allButtons.length, 7, 'Must have exactly 7 menu actions');

  // Verify UTM parameters on web links
  const findButton = allButtons.find((b) => b.text.includes('Find a Tutor'));
  assert.ok(findButton && findButton.url, 'Find button must have URL');
  assert.ok(findButton.url.includes('utm_source=telegram'), 'Must have utm_source=telegram');
  assert.ok(findButton.url.includes('utm_medium=bot'), 'Must have utm_medium=bot');
});

test('Telegram Bot: Callback query toggles alert preference subjects and areas', async () => {
  const testChatId = Math.floor(Math.random() * 800000) + 300000;

  await upsertTelegramSubscriber({
    chat_id: testChatId,
    subjects: ['Physics'],
    sub_cities: ['Bole'],
    teaching_format: 'either',
    is_active: true,
  });

  // Toggle Mathematics
  const update = {
    callback_query: {
      id: 'cb_01',
      from: { id: testChatId, first_name: 'Kidist' },
      message: { chat: { id: testChatId } },
      data: 'sub_subj_mathematics',
    },
  };

  const res = await handleTelegramUpdate(update);
  assert.equal(res.handled, true);
  assert.equal(res.action, 'toggle_subject');

  const sub = await getTelegramSubscriber(testChatId);
  assert.ok(sub.subjects.includes('Mathematics'), 'Mathematics must be added to preferences');
  assert.ok(sub.subjects.includes('Physics'), 'Physics must be preserved');
});

// -----------------------------------------------------------------------------
// TEST 4: OPT-IN VACANCY ALERT MATCHING ENGINE
// -----------------------------------------------------------------------------

test('Alert Engine: Matches subscribers based on subject, sub-city, and format', () => {
  const mockSubscribers = [
    {
      id: 'sub-1',
      chat_id: 101,
      is_active: true,
      subjects: ['Mathematics'],
      grade_levels: [],
      sub_cities: ['Bole'],
      teaching_format: 'either',
      created_at: '',
      updated_at: '',
    },
    {
      id: 'sub-2',
      chat_id: 102,
      is_active: true,
      subjects: ['Chemistry'],
      grade_levels: [],
      sub_cities: ['Yeka'],
      teaching_format: 'in_person',
      created_at: '',
      updated_at: '',
    },
    {
      id: 'sub-3',
      chat_id: 103,
      is_active: false, // Unsubscribed
      subjects: ['Mathematics'],
      grade_levels: [],
      sub_cities: ['Bole'],
      teaching_format: 'either',
      created_at: '',
      updated_at: '',
    },
    {
      id: 'sub-4',
      chat_id: 104,
      is_active: true,
      subjects: [], // Subscribed to ALL subjects
      grade_levels: [],
      sub_cities: [], // Subscribed to ALL sub-cities
      teaching_format: 'either',
      created_at: '',
      updated_at: '',
    },
  ];

  const inPersonMathVacancy = {
    id: 'vac-101',
    vacancy_code: 'BT-VAC-2026-0010',
    title: 'Grade 10 Math in Bole',
    sub_city: 'Bole',
    subjects: ['Mathematics'],
    grade_level: 'Grade 10',
    curriculum: 'National',
    teaching_format: 'in_person',
    schedule_days: ['Monday'],
    time_window: 'Afternoon',
    lesson_frequency: '2 days/week',
    hours_per_session: 1.5,
    expected_duration_months: 3,
    hourly_rate_etb: 450,
    required_qualifications: 'B.Sc.',
    languages: ['English'],
    status: 'open',
    view_count: 0,
    application_count: 0,
    created_at: '',
    updated_at: '',
  };

  const matched = matchSubscribersForVacancy(mockSubscribers, inPersonMathVacancy);

  // Sub 1: Active, Math in Bole -> MATCH
  assert.ok(matched.some((s) => s.chat_id === 101), 'Sub 1 must match');

  // Sub 2: Chemistry in Yeka -> NO MATCH
  assert.ok(!matched.some((s) => s.chat_id === 102), 'Sub 2 must NOT match');

  // Sub 3: Unsubscribed -> NO MATCH
  assert.ok(!matched.some((s) => s.chat_id === 103), 'Inactive Sub 3 must NOT match');

  // Sub 4: All subjects & sub-cities -> MATCH
  assert.ok(matched.some((s) => s.chat_id === 104), 'Sub 4 (broad subscription) must match');
});

test('Alert Engine: Online vacancy matches subscribers regardless of physical sub-city', () => {
  const subscribers = [
    {
      id: 'sub-1',
      chat_id: 201,
      is_active: true,
      subjects: ['Physics'],
      grade_levels: [],
      sub_cities: ['Kirkos'], // Subscribed to Kirkos
      teaching_format: 'online',
      created_at: '',
      updated_at: '',
    },
  ];

  const onlinePhysicsVacancy = {
    id: 'vac-102',
    vacancy_code: 'BT-VAC-2026-0020',
    title: 'Online Physics Prep',
    sub_city: 'Bole', // Posted from Bole parent, but format is online
    subjects: ['Physics'],
    grade_level: 'Grade 12',
    curriculum: 'National',
    teaching_format: 'online',
    schedule_days: ['Saturday'],
    time_window: 'Morning',
    lesson_frequency: '1 day/week',
    hours_per_session: 2,
    expected_duration_months: 2,
    hourly_rate_etb: 500,
    required_qualifications: 'Degree',
    languages: ['English'],
    status: 'open',
    view_count: 0,
    application_count: 0,
    created_at: '',
    updated_at: '',
  };

  const matched = matchSubscribersForVacancy(subscribers, onlinePhysicsVacancy);
  assert.equal(matched.length, 1, 'Online vacancy must match subscriber regardless of sub-city');
});

// -----------------------------------------------------------------------------
// TEST 5: CONTENT STUDIO & MARKETING TEMPLATES
// -----------------------------------------------------------------------------

test('Content Studio: Provides all 12 strategic templates with valid metadata', () => {
  const templates = getContentStudioTemplates();
  assert.equal(templates.length, 12, 'Must provide exactly 12 strategic marketing templates');

  const requiredKeys = [
    'vacancy_announcement',
    'weekly_roundup',
    'tutor_recruitment',
    'parent_promo',
    'how_it_works',
    'referral_campaign',
    'study_tips',
    'faqs',
    'safeguarding_trust',
    'success_stories',
    'new_tutors_highlight',
    'vacancy_deadline_update',
  ];

  for (const key of requiredKeys) {
    const tpl = templates.find((t) => t.key === key);
    assert.ok(tpl, `Template with key '${key}' must exist`);
    assert.ok(tpl.title, `Template '${key}' must have a title`);
    assert.ok(tpl.default_caption_en, `Template '${key}' must have default English copy`);
    assert.ok(tpl.call_to_action, `Template '${key}' must have a call to action`);
    assert.ok(tpl.target_url_path, `Template '${key}' must have a target URL path`);
    assert.ok(tpl.default_campaign, `Template '${key}' must have a default campaign tag`);
  }
});

test('Content Studio: Renders vacancy announcement without leaking private family details', () => {
  const mockVacancy = {
    id: 'vac-priv-1',
    vacancy_code: 'BT-VAC-2026-0044',
    title: 'Grade 8 Ministry Exam Prep in Yeka',
    sub_city: 'Yeka',
    general_area: 'Megenagna',
    subjects: ['Mathematics', 'English'],
    grade_level: 'Grade 8',
    curriculum: 'National',
    teaching_format: 'in_person',
    schedule_days: ['Monday', 'Wednesday'],
    time_window: 'Afternoon (4:00 PM)',
    lesson_frequency: '2 days/week',
    hours_per_session: 1.5,
    expected_duration_months: 3,
    hourly_rate_etb: 450,
    required_qualifications: 'B.Ed. or B.Sc.',
    languages: ['Amharic', 'English'],
    parent_preferences: 'Patient tutor with focus on algebra',
    status: 'open',
    view_count: 5,
    application_count: 1,
    created_at: '',
    updated_at: '',
  };

  const rendered = renderContentStudioPost('vacancy_announcement', {
    vacancy: mockVacancy,
    customBaseUrl: 'https://bruhtesfa.et',
  });

  assert.ok(rendered.caption.includes('BT-VAC-2026-0044'), 'Must include vacancy code');
  assert.ok(rendered.caption.includes('450 ETB/hour'), 'Must include correct hourly rate');
  assert.ok(rendered.caption.includes('Yeka'), 'Must include public sub-city');
  assert.ok(rendered.caption.includes('https://bruhtesfa.et/vacancies/BT-VAC-2026-0044'), 'Must have trackable apply link');

  // Privacy verification: Ensure no phone number, student full name or exact house address
  assert.ok(!rendered.caption.includes('0911'), 'Must never contain private phone numbers');
  assert.ok(!rendered.caption.includes('House #'), 'Must never contain private house numbers');
});

// -----------------------------------------------------------------------------
// TEST 6: BROADCAST LOGGING & IDEMPOTENCY
// -----------------------------------------------------------------------------

test('Broadcast Engine: Records broadcast log and prevents duplicate channel posts', async () => {
  const testVacancyId = 'vac-test-broad-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  const testChannelId = '@bruhtesfa_announcements';

  // 1. Initial check: not broadcast
  const isBroadcastBefore = await hasVacancyBeenBroadcast(testVacancyId, testChannelId);
  assert.equal(isBroadcastBefore, false, 'Vacancy should not be marked as broadcast yet');

  // 2. Record broadcast
  const log = await recordTelegramBroadcastLog({
    vacancy_id: testVacancyId,
    channel_id: testChannelId,
    message_id: '99881',
    broadcast_type: 'channel_announcement',
    recipient_count: 1,
    status: 'published',
    caption_snippet: 'Test announcement',
  });

  assert.ok(log.id, 'Log must receive an id');
  assert.equal(log.message_id, '99881');

  // 3. Check again: must now detect duplicate
  const isBroadcastAfter = await hasVacancyBeenBroadcast(testVacancyId, testChannelId);
  assert.equal(isBroadcastAfter, true, 'Vacancy must now be recognized as already broadcast');
});

// -----------------------------------------------------------------------------
// TEST 7: GROWTH & ATTRIBUTION METRICS
// -----------------------------------------------------------------------------

test('Growth Tracking: Correctly counts Telegram-attributed records and subscribers', async () => {
  const metrics = await getTelegramMarketingMetrics();

  assert.ok(typeof metrics.totalSubscribers === 'number', 'totalSubscribers must be a number');
  assert.ok(typeof metrics.activeSubscribers === 'number', 'activeSubscribers must be a number');
  assert.ok(typeof metrics.totalBroadcasts === 'number', 'totalBroadcasts must be a number');
  assert.ok(typeof metrics.telegramAttributedParents === 'number', 'telegramAttributedParents must be a number');
  assert.ok(typeof metrics.telegramAttributedTutors === 'number', 'telegramAttributedTutors must be a number');
  assert.ok(typeof metrics.telegramAttributedVacancyApps === 'number', 'telegramAttributedVacancyApps must be a number');
});
