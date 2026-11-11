export interface Criterion { id: string; label: string; tip: string }

export interface Rate { room: string; perNight: number; breakfast: boolean; cancel: string }

/** A practice-call template. Every trainee gets their own generated variant of it. */
export interface Roleplay {
  id: string;
  title: string;
  scenario: string;
  hotel: string;
  town: string;
  /** "out": the trainee calls the guest. "in": the guest calls the hotel. The AI always speaks first. */
  dir: "out" | "in";
  voice: "female" | "male";
  /** Gender for the generated name when it differs from the voice (e.g. a spouse answering). */
  nameGender?: "female" | "male";
  /** Display label; "{name}" is replaced with the generated name. */
  guest: string;
  from: string;
  /** Days from today until arrival. */
  arrive: number;
  /** Keep the arrival date exactly as written (e.g. "travelling tomorrow"). */
  fixedDates?: boolean;
  nights: number;
  adults: number;
  children: number[];
  rates: Rate[];
  kb: Record<string, string>;
  /** Support calls: the existing booking as shown in the booking system. "{ref}" becomes a fresh reference. */
  booking?: Record<string, string>;
  /** What the call is about, for the AI guest (replaces the default abandoned-booking context). */
  situation?: string;
  /** "{name}" is replaced with the generated name. */
  persona: string;
  /** Hidden from trainees. Only the AI guest sees this. "{name}" is replaced. */
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

export interface Level {
  id: number;
  title: string;
  summary: string;
  badge: string;
  /** Lesson ids (roleplay or drill ids) in order. */
  lessons: string[];
}

export interface Pack {
  id: string;
  name: string;
  description: string;
  /** Who the trainee is, for the AI prompts, e.g. "reservations agent". */
  staffRole?: string;
  /** Label of the tab that shows rates and facts during a call. */
  systemLabel?: string;
  /** Score needed to pass a lesson. */
  passMark: number;
  /** Sessions per day that count as "present" for attendance. */
  dailyGoal: number;
  knowledgeBase?: Record<string, string>;
  criteria: Criterion[];
  levels: Level[];
  roleplays: Roleplay[];
  drills: Drill[];
}
