export interface MicroLearning {
  id: string;
  title: string;
  content: string;
  category: "urges" | "pausing" | "slips" | "habits" | "identity";
}

export const microLearnings: MicroLearning[] = [
  {
    id: "urge-wave",
    title: "The Urge Wave",
    content: "Urges feel urgent, but they're actually waves — they rise, peak, and naturally fall within 15-20 minutes. You don't have to act on them to make them go away. Just ride the wave.",
    category: "urges",
  },
  {
    id: "pause-power",
    title: "The Power of the Pause",
    content: "When you pause before acting, you activate your prefrontal cortex — the brain's decision-making center. Even a 10-second pause can shift you from autopilot to conscious choice.",
    category: "pausing",
  },
  {
    id: "slips-normal",
    title: "Slips Are Normal",
    content: "Research shows that slips are a normal part of behavior change. What matters isn't perfection — it's how quickly you return to your path. One slip doesn't erase your progress.",
    category: "slips",
  },
  {
    id: "habit-loop",
    title: "Understanding the Habit Loop",
    content: "Every habit follows a loop: Cue → Craving → Response → Reward. You can't always control the cue, but you can change your response. That's where your power lies.",
    category: "habits",
  },
  {
    id: "identity-shift",
    title: "Identity-Based Change",
    content: "Lasting change comes from shifting how you see yourself. Instead of 'I'm trying to quit,' try 'I'm becoming someone who chooses differently.' Your actions follow your identity.",
    category: "identity",
  },
  {
    id: "urge-temporary",
    title: "Urges Are Temporary",
    content: "Your brain creates urgency to push you toward immediate rewards. But that urgency is a feeling, not a fact. The discomfort of waiting is temporary; the satisfaction of choosing wisely lasts.",
    category: "urges",
  },
  {
    id: "self-compassion",
    title: "Self-Compassion Works",
    content: "Studies show that people who treat themselves with kindness after setbacks are more likely to succeed long-term. Harsh self-criticism actually makes relapse more likely.",
    category: "slips",
  },
  {
    id: "small-wins",
    title: "Small Wins Compound",
    content: "Each time you pause and choose differently, you strengthen neural pathways that make the next choice easier. Progress isn't always visible, but it's happening with every conscious moment.",
    category: "habits",
  },
];

export function getRandomMicroLearning(viewedIds: string[]): MicroLearning | null {
  const unviewed = microLearnings.filter(m => !viewedIds.includes(m.id));
  if (unviewed.length === 0) return null;
  return unviewed[Math.floor(Math.random() * unviewed.length)];
}

export const experimentSuggestions = [
  {
    title: "Pause once a day",
    description: "Even when you're not tempted, practice the pause. Build the muscle.",
    duration: "3 days",
  },
  {
    title: "Notice one urge",
    description: "Just notice and name an urge today. No action needed — awareness counts.",
    duration: "1 day",
  },
  {
    title: "Try your alternative",
    description: "When tempted, try your planned alternative behavior for just 2 minutes.",
    duration: "This week",
  },
  {
    title: "Evening check-in",
    description: "Before bed, take 30 seconds to notice how you navigated today's temptations.",
    duration: "5 days",
  },
  {
    title: "Morning intention",
    description: "Each morning, set one small intention for how you'll handle urges today.",
    duration: "1 week",
  },
];
