// Customer support pack: ready for scenarios.
//
// When the support knowledge base arrives:
// 1. Put the approved facts in `knowledgeBase` (one short sentence per entry).
// 2. Add practice calls to `roleplays` and drills to `drills` (same shape as sales.ts).
//    Use `kb` on each call to show the trainee only the facts that call needs.
// 3. Push to main. The app shows the pack to everyone whose team is "Customer support".

import type { Pack } from "../types.ts";

const pack: Pack = {
  id: "support",
  name: "Customer support",
  description: "Existing bookings, changes, complaints and in-stay problems.",
  knowledgeBase: {},
  criteria: [
    { id: "greeting", label: "Greeting", tip: "Say your name and the hotel, mention the call is recorded, and ask how you can help." },
    { id: "verification", label: "Verification", tip: "Confirm the guest's name and booking reference before discussing or changing any booking." },
    { id: "empathy", label: "Empathy", tip: "Acknowledge the problem in the guest's own words before solving it. Never argue." },
    { id: "kb_facts", label: "Facts from KB", tip: "Policies and facts only from the knowledge base. If it is not there, say you'll check and come back." },
    { id: "resolution", label: "Resolution", tip: "Offer only what policy allows. State exactly what happens next and when." },
    { id: "escalation", label: "Escalation", tip: "Hand complaints, refunds outside policy, safety issues and groups to the right person." },
    { id: "no_card", label: "No card by phone", tip: "Never take card details by phone. Use the secure link." },
    { id: "close", label: "Close", tip: "Summarise what was agreed and ask \"Is there anything else I can help with?\"" },
    { id: "clarity", label: "Clarity & tone", tip: "Calm, short turns, one question at a time, warm British English." },
  ],
  roleplays: [],
  drills: [],
};

export default pack;
