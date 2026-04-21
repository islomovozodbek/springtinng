/**
 * KeyboardSprint — Daily Prompts (Curated: 50 best)
 *
 * Criteria for inclusion:
 * - Drops the writer into a specific, concrete moment
 * - Creates immediate tension or mystery without over-explaining
 * - Not a cliché horror/mystery trope (no clocks running backward, mirrors, etc.)
 * - High narrative yield — many possible directions from one line
 * - Writeable in a 3-minute sprint
 */

export const DAILY_PROMPTS = [
  { id: "d1",  text: "The voicemail had been sitting there for three years, and today you finally pressed play…", category: "mystery" },
  { id: "d2",  text: "She left everything on the kitchen table: the ring, the key, and a single playing card…", category: "mystery" },
  { id: "d3",  text: "The doctor said it wasn't serious, then paused for exactly too long…", category: "slice" },
  { id: "d4",  text: "You found your own handwriting on a note you're certain you never wrote…", category: "horror" },
  { id: "d5",  text: "He called it a coincidence. She called it the third time this week…", category: "mystery" },
  { id: "d6",  text: "The letter was addressed to you, but the name it used was one you'd never told anyone…", category: "mystery" },
  { id: "d7",  text: "She asked if you remembered her, and you lied…", category: "romance" },
  { id: "d8",  text: "The last text he sent said 'don't open the door for anyone tonight'…", category: "horror" },
  { id: "d9",  text: "The camera roll had no photos from the three hours you can't account for…", category: "horror" },
  { id: "d10", text: "It was the most ordinary day of his life, until the obituary landed on the doorstep…", category: "mystery" },
  { id: "d11", text: "The stranger's book had your name written in the margins, over and over…", category: "horror" },
  { id: "d12", text: "He said he'd never been to that city. Then she found the matchbook in his coat…", category: "mystery" },
  { id: "d13", text: "She printed out every conversation they'd ever had and spread it across the floor…", category: "romance" },
  { id: "d14", text: "You thought you were alone in the house until you saw two coffee cups on the counter…", category: "horror" },
  { id: "d15", text: "The child drew the same picture every day for a year, then stopped completely…", category: "horror" },
  { id: "d16", text: "The taxi driver had the same tattoo as your grandfather. They'd both been dead for years…", category: "horror" },
  { id: "d17", text: "Something had been moved in the apartment. Just one thing. Just an inch…", category: "horror" },
  { id: "d18", text: "The ad in the newspaper was from 1967. The phone number still worked…", category: "mystery" },
  { id: "d19", text: "You were the only passenger. The driver didn't ask where you were going…", category: "horror" },
  { id: "d20", text: "She remembered every detail of a dream she'd never had…", category: "scifi" },
  { id: "d21", text: "The manuscript ended with the author's name and a date two years from now…", category: "mystery" },
  { id: "d22", text: "He was supposed to meet you at eight. By nine, his number no longer existed…", category: "mystery" },
  { id: "d23", text: "You asked the old woman how long the village had been there. She said it hadn't…", category: "horror" },
  { id: "d24", text: "He wrote in her birthday card something only she would understand, and it terrified her…", category: "mystery" },
  { id: "d25", text: "The news report was wrong about one detail — a detail only you knew…", category: "mystery" },
  { id: "d26", text: "The boy had been missing for a week when they found his room completely rearranged…", category: "mystery" },
  { id: "d27", text: "You matched with someone on a dating app whose photos were taken inside your apartment…", category: "horror" },
  { id: "d28", text: "The box had been in storage for thirty years. The handwriting on the outside was your mother's. It was dated last week…", category: "horror" },
  { id: "d29", text: "He recognized the waitress. She pretended not to know him either…", category: "mystery" },
  { id: "d30", text: "The dog walked into the empty room and sat down, tail wagging, as if greeting someone…", category: "horror" },
  { id: "d31", text: "You gave a eulogy at a stranger's funeral and somehow knew everything about her…", category: "mystery" },
  { id: "d32", text: "The airline lost your bag and delivered it to an address you recognize but have never been to…", category: "mystery" },
  { id: "d33", text: "You recognized someone in a photograph taken forty years before you were born…", category: "horror" },
  { id: "d34", text: "Everyone who'd stayed in that hotel room had checked out early. You were next…", category: "horror" },
  { id: "d35", text: "You wrote it as fiction. Three weeks later it started coming true…", category: "horror" },
  { id: "d36", text: "The lighthouse keeper's log had a gap of seven years, then a single line: 'Still waiting.'…", category: "mystery" },
  { id: "d37", text: "The chess game had been running for eleven years. Someone finally made a move…", category: "mystery" },
  { id: "d38", text: "She burned everything she owned the day after her birthday, starting with the photographs…", category: "mystery" },
  { id: "d39", text: "You found an old restaurant reservation in your name — for next Thursday…", category: "horror" },
  { id: "d40", text: "They said the village flooded forty years ago. The postman still delivered there every Tuesday…", category: "horror" },
  { id: "d41", text: "You recognized the painting at the auction as one that had hung in your childhood bedroom…", category: "mystery" },
  { id: "d42", text: "The surgeon paused mid-operation and said something no one in the room ever repeated…", category: "mystery" },
  { id: "d43", text: "He kept insisting it was just a photo. But the timestamp said tomorrow…", category: "scifi" },
  { id: "d44", text: "She wore the same dress to every important moment in her life. At the funeral she noticed everyone else did too…", category: "horror" },
  { id: "d45", text: "You sent a message by mistake. The reply came instantly: 'I've been waiting for you to reach out.'…", category: "horror" },
  { id: "d46", text: "The old library card had exactly one book listed as checked out and never returned: yours…", category: "mystery" },
  { id: "d47", text: "The hotel room had a single framed photo on the wall: your street, your building, your window…", category: "horror" },
  { id: "d48", text: "She said she didn't remember the accident. You weren't sure you believed her. She wasn't sure she did either…", category: "mystery" },
  { id: "d49", text: "You answered an ad for a job you never applied for. The interviewer already knew your name…", category: "mystery" },
  { id: "d50", text: "The last guest had checked out three days ago. The bed had been slept in last night…", category: "horror" },
];

/**
 * Get today's daily prompt deterministically from a date string.
 * Same date → always same prompt. No randomness.
 * @param {string} dateStr - ISO date string like '2026-04-14'
 * @returns {object} - the daily prompt object
 */
export function getDailyPrompt(dateStr) {
  const seed = dateStr.replace(/-/g, "");
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % DAILY_PROMPTS.length;
  }
  return DAILY_PROMPTS[hash];
}

/**
 * Get today's UTC date string (YYYY-MM-DD).
 */
export function getTodayUTC() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get milliseconds until the next UTC midnight (next daily prompt).
 */
export function getMsUntilNextPrompt() {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return tomorrow.getTime() - now.getTime();
}
