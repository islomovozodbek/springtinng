/**
 * Central achievement registry and unlock logic for sprinting.ink
 */

export const ALL_ACHIEVEMENTS = [
  { id: "first-story",    icon: "🎯", name: "Starter Writer",       desc: "Write your first story",                        auraReward: 40  },
  { id: "og",             icon: "👑", name: "OG",                   desc: "Among the first 100 registered users",           auraReward: 200 },
  { id: "streak-3",       icon: "🔥", name: "Hat Trick",            desc: "3-day writing streak",                           auraReward: 30  },
  { id: "streak-7",       icon: "🔥", name: "Week Warrior",         desc: "7-day writing streak",                           auraReward: 60  },
  { id: "streak-14",      icon: "🔥", name: "Fortnight Force",      desc: "14-day writing streak",                          auraReward: 100 },
  { id: "streak-30",      icon: "🔥", name: "Month Master",         desc: "30-day writing streak",                          auraReward: 200 },
  { id: "stories-10",     icon: "📝", name: "Getting Started",      desc: "Write 10 stories",                               auraReward: 50  },
  { id: "stories-50",     icon: "✍️", name: "Prolific Writer",      desc: "Write 50 stories",                               auraReward: 150 },
  { id: "chain-starter",  icon: "🔗", name: "Chain Starter",        desc: "3+ people continued your story",                 auraReward: 80  },
  { id: "upvotes-50",     icon: "⬆️", name: "Rising Star",          desc: "Receive 50 total upvotes",                       auraReward: 60  },
  { id: "upvotes-100",    icon: "⬆️", name: "Crowd Favorite",       desc: "Receive 100 total upvotes",                      auraReward: 120 },
  { id: "social",         icon: "🤝", name: "Social Butterfly",     desc: "Follow 20 people",                               auraReward: 40  },
  { id: "recruiter",      icon: "📨", name: "Recruiter",            desc: "Refer 3 friends who sign up",                    auraReward: 100 },
  { id: "weekly-champ",   icon: "🏆", name: "Weekly Champion",      desc: "Reach #1 on weekly leaderboard",                 auraReward: 200 },
  { id: "speed-demon",    icon: "⚡", name: "Speed Demon",          desc: "Complete a 1-min sprint",                        auraReward: 30  },
  { id: "marathon",       icon: "📝", name: "Marathon Writer",      desc: "Complete a 5-min sprint",                        auraReward: 30  },
  { id: "night-owl",      icon: "🦉", name: "Night Owl",            desc: "Write a story between midnight and 4 AM",        auraReward: 40  },
  { id: "early-bird",     icon: "🐦", name: "Early Bird",           desc: "Write a story between 5 AM and 7 AM",            auraReward: 40  },
  // Brainrot Achievements
  { id: "yapper",         icon: "🗣️", name: "Professional Yapper",  desc: "Write 200 words in a single sprint",             auraReward: 60  },
  { id: "cooking",        icon: "👨‍🍳", name: "Bro is Cooking",      desc: "Get 10 upvotes on a single story",               auraReward: 100 },
  { id: "touch-grass",    icon: "🌱", name: "Touch Grass",          desc: "Play a sprint on mobile",                        auraReward: 40  },
  { id: "aint-no-way",    icon: "💀", name: "Ain't No Way",         desc: "Survive a 3-minute Hardcore sprint",             auraReward: 200 },
  { id: "negative-aura",  icon: "📉", name: "Negative Aura",        desc: "Trash a sprint right after finishing it",        auraReward: 20  },
];

/**
 * Build the set of achievement IDs the user should have, based purely
 * on their current profile stats.
 *
 * @param {object} user    - the local user object from AuthContext
 * @param {object} [opts]  - optional sprint-time overrides
 *   @param {number}  opts.wordCount       - words written this sprint
 *   @param {number}  opts.timerMinutes    - sprint duration in minutes
 *   @param {boolean} opts.isHardcore      - was hardcore mode active?
 *   @param {boolean} opts.isMobile        - was this a mobile session?
 * @returns {Set<string>} - full set of earned achievement IDs
 */
export function computeEarnedAchievements(user, opts = {}) {
  const {
    wordCount = 0,
    timerMinutes = 0,
    isHardcore = false,
    isMobile = false,
  } = opts;

  const earned = new Set(user.earnedAchievements || []);

  // ── Stat-based (always evaluated) ─────────────────────────────────
  if (user.totalStories >= 1)             earned.add("first-story");
  if (user.isOG)                          earned.add("og");
  if (user.currentStreak >= 3)            earned.add("streak-3");
  if (user.currentStreak >= 7)            earned.add("streak-7");
  if (user.currentStreak >= 14)           earned.add("streak-14");
  if (user.currentStreak >= 30)           earned.add("streak-30");
  if (user.totalStories >= 10)            earned.add("stories-10");
  if (user.totalStories >= 50)            earned.add("stories-50");
  if (user.totalUpvotesReceived >= 50)    earned.add("upvotes-50");
  if (user.totalUpvotesReceived >= 100)   earned.add("upvotes-100");
  if (user.followingCount >= 20)          earned.add("social");
  if (user.referralCount >= 3)            earned.add("recruiter");

  // ── Time-of-day (use the current moment unless already earned) ─────
  if (!earned.has("night-owl") || !earned.has("early-bird")) {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 4)   earned.add("night-owl");
    if (hour >= 5 && hour < 7)   earned.add("early-bird");
  }

  // ── Sprint-time extras (only meaningful when called from sprint) ───
  if (wordCount >= 200)                                       earned.add("yapper");
  if (isMobile)                                               earned.add("touch-grass");
  if (isHardcore && timerMinutes >= 3 && wordCount > 0)      earned.add("aint-no-way");
  if (timerMinutes === 1)                                     earned.add("speed-demon");
  if (timerMinutes === 5)                                     earned.add("marathon");

  return earned;
}

/**
 * Returns only the IDs that are newly unlocked (not yet in the DB).
 *
 * @param {string[]} existing - current earned_achievements from the profile
 * @param {Set<string>} newSet - full computed set
 * @returns {string[]} - IDs to add
 */
export function getNewlyUnlocked(existing, newSet) {
  const existingSet = new Set(existing);
  return [...newSet].filter((id) => !existingSet.has(id));
}

/**
 * Look up an achievement definition by ID.
 * @param {string} id
 * @returns {{ id, icon, name, desc, auraReward } | undefined}
 */
export function getAchievementById(id) {
  return ALL_ACHIEVEMENTS.find((a) => a.id === id);
}
