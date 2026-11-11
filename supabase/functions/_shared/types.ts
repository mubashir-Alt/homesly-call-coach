export interface Criterion { id: string; label: string; tip: string }

export interface Rate { room: string; perNight: number; breakfast: boolean; cancel: string }

export interface Roleplay {
  id: string;
  title: string;
  scenario: string;
  hotel: string;
  town: string;
  /** "out": the trainee calls the guest. "in": the guest calls the hotel and speaks first. */
  dir: "out" | "in";
  voice: "female" | "male";
  guest: string;
  from: string;
  /** Days from today until arrival. */
  arrive: number;
  nights: number;
  adults: number;
  children: number[];
  rates: Rate[];
  kb: Record<string, string>;
  persona: string;
  /** Hidden from trainees. Only the AI guest sees this. */
  behaviour: string;
  targets: string[];
}

export interface Drill {
  id: string;
  title: string;
  from: string;
  guest: string;
  was: string;
  task: string;
  targets: string[];
}

export interface Pack {
  id: string;
  name: string;
  description: string;
  knowledgeBase?: Record<string, string>;
  criteria: Criterion[];
  roleplays: Roleplay[];
  drills: Drill[];
}
