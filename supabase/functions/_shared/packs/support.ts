// Customer support pack: existing bookings, changes, refunds, in-stay problems, complaints and incidents.
//
// STARTER VERSION. Built from the support moments in the recorded calls (Hampton fire, Berwick deposit,
// Portsoy sea view, Gloucester parking, OTA changes) and the KB template (docs A-I). Hotel facts below are
// practice values. When the support knowledge base arrives, replace the `kb` values (and add lessons) so
// trainees learn the real answers.
//
// HOW TO EDIT
// - Add a practice call: copy one object in `roleplays`, give it a new id (SR12...). Add it to a level.
// - Add a drill: copy one object in `drills`, give it a new id (SD13...). Add it to a level.
// - `booking` is what the trainee sees in the Booking system tab. "{ref}" becomes a fresh reference per trainee.
// - `situation` tells the AI guest what the call is about. `behaviour` is hidden from trainees.
// - `arrive` = days from today (negative = a past stay). Use `fixedDates: true` to keep it exact.

import type { Pack } from "../types.ts";

const pack: Pack = {
  id: "support",
  name: "Customer support",
  description: "Existing bookings, changes, refunds, in-stay problems, complaints and incidents.",
  staffRole: "guest support agent",
  systemLabel: "Booking system",
  passMark: 75,
  dailyGoal: 3,
  levels: [
    { id: 1, title: "Support foundations", badge: "Warm Welcome", summary: "Greet properly, find the booking, and confirm who you're speaking to before you discuss anything.", lessons: ["SD01", "SD02", "SR01"] },
    { id: 2, title: "Changes & amendments", badge: "The Fixer", summary: "Change dates, add nights and update names: live prices only, and OTA bookings go back to the OTA.", lessons: ["SR02", "SD03", "SR03", "SD04"] },
    { id: 3, title: "Payments & refunds", badge: "Straight Talker", summary: "Deposits, refunds and charges: explain the rate's terms plainly, never take a card by phone, never promise money back.", lessons: ["SD05", "SR04", "SD06", "SR05"] },
    { id: 4, title: "In-stay problems", badge: "Problem Solver", summary: "Locked out, cold rooms, noise and the wrong room: calm the guest, follow the procedure, give a time.", lessons: ["SR06", "SD07", "SR07", "SD08"] },
    { id: 5, title: "Complaints & recovery", badge: "Calm Under Fire", summary: "Listen first, apologise for the experience, offer only what policy allows, and escalate the rest.", lessons: ["SR08", "SD09", "SD10", "SR09"] },
    { id: 6, title: "Incidents & escalation", badge: "Safe Hands", summary: "Closures, safety issues, invoices and lost property: know when to hand over and to whom.", lessons: ["SR10", "SD11", "SD12", "SR11"] },
  ],
  criteria: [
    { id: "greeting", label: "Greeting", tip: "Say your name and the hotel, mention the call is recorded, and ask how you can help." },
    { id: "verification", label: "Verification", tip: "Confirm the guest's full name and booking reference (or dates) before discussing or changing any booking." },
    { id: "empathy", label: "Empathy", tip: "Acknowledge the problem in the guest's own words before solving it. Apologise for the experience. Never argue." },
    { id: "kb_facts", label: "Facts from KB", tip: "Policies and facts only from the booking system and knowledge base. If it isn't there: \"I'll check with the team and call you back by [time].\"" },
    { id: "resolution", label: "Resolution", tip: "Offer only what policy allows: no invented refunds, discounts or free nights. Say exactly what happens next and when." },
    { id: "escalation", label: "Escalation", tip: "Hand complaints beyond policy, refunds, safety issues, closures and groups to the duty manager or right team, with a time." },
    { id: "no_card", label: "No card by phone", tip: "Never take card details by phone. Payments and refunds go through the secure link or the original payment method." },
    { id: "close", label: "Close", tip: "Summarise what was agreed and ask \"Is there anything else I can help with?\"" },
    { id: "clarity", label: "Clarity & tone", tip: "Calm, short turns, one question at a time, warm British English." },
  ],
  roleplays: [
    /* ---------- Level 1 ---------- */
    {
      id: "SR01", title: "Pre-arrival questions", scenario: "Pre-arrival", hotel: "Central Hotel", town: "Gloucester", dir: "in", voice: "female",
      guest: "Guest", from: "Real calls on 3 and 5 Nov (parking asked, answered two different ways)", arrive: 4, nights: 2, adults: 2, children: [],
      situation: "You have a confirmed booking and are calling with questions before you arrive.",
      booking: { "Reference": "{ref}", "Booked via": "Direct (hotel website)", "Room": "Deluxe Double", "Rate": "Breakfast included, free cancellation until 48 hours before", "Status": "Confirmed, paid in full" },
      rates: [],
      kb: { "Check-in / out": "15:00 / 11:00", "Early check-in": "Not guaranteed; luggage can be left at reception from 10:00", "Parking": "Not in knowledge base", "Breakfast": "07:30–10:00 in the dining room" },
      persona: "{name}, driving down for a family birthday. Friendly and organised.",
      behaviour: "Open with: you're coming on Friday and have a couple of questions. Ask what time you can check in and whether you can arrive early. Then ask if there's parking at the hotel and how much it is. If the agent guesses about parking, accept it (that's the trap). If they promise to check and call back, give your mobile and say thanks. Do not give your booking reference unless asked.",
      targets: ["greeting", "verification", "kb_facts"],
    },
    /* ---------- Level 2 ---------- */
    {
      id: "SR02", title: "Move my booking to new dates", scenario: "Amendment", hotel: "Coach House", town: "Otterburn", dir: "in", voice: "male",
      guest: "Guest", from: "Common support request (date change on a direct booking)", arrive: 9, nights: 2, adults: 2, children: [],
      situation: "You have a direct booking and need to move it one week later because of a work clash.",
      booking: { "Reference": "{ref}", "Booked via": "Direct", "Room": "Double", "Current rate": "£92/night, breakfast included, free cancellation until 48 hours before", "Status": "Confirmed, paid in full" },
      rates: [{ room: "Double (new dates, one week later)", perNight: 104, breakfast: true, cancel: "Free cancellation until 48 hours before arrival" }],
      kb: { "Date changes": "Direct flexible bookings can move dates for free; the guest pays any difference in rate via the secure link", "Card payments": "Secure link only" },
      persona: "{name}, works shifts, apologetic about the change.",
      behaviour: "Ask to move your stay to exactly one week later, same nights. When told the new price is higher, ask whether they can keep the old price. Accept the difference if explained clearly. If the agent offers to take your card now, offer to read it out (trap). Want confirmation of the new dates read back with the weekday.",
      targets: ["verification", "resolution", "no_card"],
    },
    {
      id: "SR03", title: "Can we stay another night?", scenario: "Extension", hotel: "Station Hotel", town: "Portsoy", dir: "in", voice: "female", fixedDates: true,
      guest: "Guest", from: "Agent 4.3 extension scenario (Shared Library)", arrive: -1, nights: 2, adults: 2, children: [],
      situation: "You are staying at the hotel right now and checking out tomorrow. You'd like an extra night and a late check-out.",
      booking: { "Reference": "{ref}", "Booked via": "Direct", "Room": "Double, sea view", "Status": "In house, checking out tomorrow" },
      rates: [{ room: "Same room, extra night", perNight: 78, breakfast: true, cancel: "Non-refundable once added" }],
      kb: { "Late check-out": "Until 12:00 for direct bookings; later is not guaranteed", "Extensions": "Same room if free; pay through the secure link or at reception" },
      persona: "{name}, on a relaxed coastal break, loving the area.",
      behaviour: "Ask if you can stay one more night in the same room, and then ask for check-out at 3pm on the final day. Push once for 3pm. Accept 12:00 if explained kindly. Ask how to pay; say you'd rather just give the card now.",
      targets: ["kb_facts", "resolution", "no_card"],
    },
    /* ---------- Level 3 ---------- */
    {
      id: "SR04", title: "Why is there a £200 deposit?", scenario: "Payments", hotel: "Homesly Guestrooms", town: "Berwick", dir: "in", voice: "male",
      guest: "Guest", from: "Real call on 26 Oct (\"no deposit\" said, but the guest saw £200 online)", arrive: 6, nights: 3, adults: 2, children: [],
      situation: "You booked and then noticed a £200 deposit in the terms. A previous call told you there was no deposit.",
      booking: { "Reference": "{ref}", "Booked via": "Direct", "Room": "Double", "Rate": "Room only, free cancellation until 48 hours before", "Status": "Confirmed, pay on arrival" },
      rates: [],
      kb: { "Deposit / pre-authorisation": "Not in knowledge base", "Payment": "Secure link only; never by phone" },
      persona: "{name}, careful with money, slightly annoyed about being told two different things.",
      behaviour: "Ask why there's a £200 deposit when someone said there wasn't one. Ask whether it's a charge or a hold, and when you'd get it back. If the agent invents an answer, accept it (trap). If they apologise for the mixed messages and promise a confirmed answer by a set time, calm down.",
      targets: ["empathy", "kb_facts", "resolution"],
    },
    {
      id: "SR05", title: "I've been charged twice", scenario: "Payments", hotel: "Park Hotel", town: "", dir: "in", voice: "female", fixedDates: true,
      guest: "Guest", from: "Common support request (duplicate charge)", arrive: -6, nights: 1, adults: 1, children: [],
      situation: "You stayed last week and your bank statement shows two charges for the stay.",
      booking: { "Reference": "{ref}", "Booked via": "Direct", "Room": "Superior Double", "Payment log": "One payment taken at booking; no second charge on our system", "Status": "Checked out" },
      rates: [],
      kb: { "Refunds": "Finance team handles refunds to the original card within 5–7 working days after checking", "Pending holds": "Card pre-authorisations can show as a charge for a few days", "Card details": "Never take or read back card numbers" },
      persona: "{name}, busy, a bit stressed about money this month.",
      behaviour: "Say you've been charged twice for one night. Offer to read out your card number so they can find it (trap). Want to know when you'll get the money back. Calm down if told the next step and a time frame, and if the agent explains a hold may drop off.",
      targets: ["verification", "no_card", "escalation"],
    },
    /* ---------- Level 4 ---------- */
    {
      id: "SR06", title: "Locked out at night", scenario: "In-stay", hotel: "Coach House", town: "Otterburn", dir: "in", voice: "male", fixedDates: true,
      guest: "Guest", from: "KB doc A night procedure", arrive: 0, nights: 1, adults: 2, children: [],
      situation: "It's 11:40 at night. You're standing outside the hotel; the front door code isn't working and reception is closed.",
      booking: { "Reference": "{ref}", "Room": "Double, room 4", "Status": "In house (checked in at 16:10)" },
      rates: [],
      kb: { "Night procedure": "Front door code is sent by text on check-in day; if it fails, call the on-call manager on the night line and stay on the line", "On-call manager": "Can reach the hotel within 20 minutes", "Safety": "If the guest feels unsafe, advise a lit public place and call 999 in an emergency" },
      persona: "{name}, cold, tired after a long walk, partner with him.",
      behaviour: "Sound stressed: the door code doesn't work and it's freezing. Read out a code that's one digit wrong if asked. Ask how long it will take. Calm down if the agent is clear, gives a time, and checks you're safe.",
      targets: ["empathy", "kb_facts", "escalation"],
    },
    {
      id: "SR07", title: "The room next door is too loud", scenario: "In-stay", hotel: "Central Hotel", town: "Gloucester", dir: "in", voice: "female", fixedDates: true,
      guest: "Guest", from: "Common in-stay complaint", arrive: 0, nights: 2, adults: 1, children: [],
      situation: "It's late evening. You're in your room and the people next door have been loud for an hour.",
      booking: { "Reference": "{ref}", "Room": "Superior Twin, room 12", "Status": "In house" },
      rates: [],
      kb: { "Noise": "Duty staff will speak to the other room; if it continues, offer a room move if one is free", "Free rooms tonight": "One Deluxe Double free on the top floor", "Compensation": "Only the duty manager can agree any refund or discount" },
      persona: "{name}, has an early meeting tomorrow, tired and sharp.",
      behaviour: "Complain about the noise. Ask for a refund for tonight. If the agent promises a refund, accept it (trap). Accept a room move or the noise being dealt with if offered with a clear time. Ask \"and what happens if it starts again?\"",
      targets: ["empathy", "resolution", "escalation"],
    },
    /* ---------- Level 5 ---------- */
    {
      id: "SR08", title: "Terrible stay, I want my money back", scenario: "Complaint", hotel: "Woodman Inn", town: "", dir: "in", voice: "male", fixedDates: true,
      guest: "Guest", from: "Complaint route X04 (Shared Library)", arrive: -3, nights: 2, adults: 2, children: [],
      situation: "You checked out yesterday after a disappointing stay: the shower ran cold both mornings and breakfast ran out.",
      booking: { "Reference": "{ref}", "Booked via": "Direct", "Room": "Superior King", "Rate": "Breakfast included, non-refundable", "Status": "Checked out" },
      rates: [],
      kb: { "Complaints": "Log the complaint, apologise, and pass to the duty manager, who replies within 24 hours", "Refunds and goodwill": "Only the duty manager can agree a refund or goodwill gesture" },
      persona: "{name}, angry but reasonable if listened to. Has paid a lot for this weekend.",
      behaviour: "Start angry and list the problems. Interrupt once if the agent starts with excuses. Demand a full refund. If the agent offers money themselves, accept (trap). Soften if they listen, apologise and explain the duty manager will reply by a set time. Want the agent to repeat your complaint back.",
      targets: ["empathy", "resolution", "escalation"],
    },
    {
      id: "SR09", title: "A staff member was rude to me", scenario: "Complaint", hotel: "County Hotel", town: "Selkirk", dir: "in", voice: "female", fixedDates: true,
      guest: "Guest", from: "Common complaint", arrive: -2, nights: 1, adults: 2, children: [],
      situation: "You stayed two nights ago. The receptionist at check-in was dismissive when you asked about a cot.",
      booking: { "Reference": "{ref}", "Room": "Family room", "Status": "Checked out" },
      rates: [],
      kb: { "Staff complaints": "Never discuss or defend the staff member; log it for the hotel manager, who replies within 2 working days", "Cots": "Available free on request; must be requested before arrival" },
      persona: "{name}, travelling with a toddler, hurt more than angry.",
      behaviour: "Explain what happened. Ask for the staff member's name and whether they'll be disciplined. If the agent defends the colleague or blames you, get upset. Calm down if they listen, apologise and explain who will reply and when.",
      targets: ["empathy", "escalation", "close"],
    },
    /* ---------- Level 6 ---------- */
    {
      id: "SR10", title: "Hotel closed after a fire", scenario: "Incident", hotel: "Hampton Hotel", town: "Wells", dir: "in", voice: "female",
      guest: "Guest", from: "Real call on 26 Oct (stays cancelled after a fire, booked via Booking.com)", arrive: 5, nights: 2, adults: 2, children: [],
      situation: "You got an email saying your stay is cancelled because of a fire at the hotel. You booked through Booking.com.",
      booking: { "Reference": "{ref}", "Booked via": "Booking.com", "Status": "Cancelled by hotel (fire, closed until further notice)" },
      rates: [],
      kb: { "Incident": "Hotel closed after a fire; all stays cancelled. No one was hurt.", "Refunds for OTA bookings": "Full refund through Booking.com; the guest contacts Booking.com, and we confirm the cancellation to them", "Alternatives": "Not in knowledge base", "Incident owner": "Operations manager handles all incident calls beyond these facts" },
      persona: "{name}, booked for an anniversary, upset and confused about who refunds what.",
      behaviour: "Ask what happened and whether you'll get your money back. Ask the agent to refund you directly. Ask if they can move you to another hotel nearby at the same price. If the agent invents an alternative or a refund route, accept it (trap). Calm down if the answer is clear and honest.",
      targets: ["empathy", "kb_facts", "escalation"],
    },
    {
      id: "SR11", title: "I left something in my room", scenario: "Lost property", hotel: "George Hotel", town: "Montrose", dir: "in", voice: "male", fixedDates: true,
      guest: "Guest", from: "Common support request", arrive: -2, nights: 1, adults: 1, children: [],
      situation: "You checked out yesterday morning and think you left your phone charger and a watch in the room.",
      booking: { "Reference": "{ref}", "Room": "Double", "Status": "Checked out" },
      rates: [],
      kb: { "Lost property": "Housekeeping logs found items for 30 days; staff check and call back the same day", "Posting items": "Guest pays postage via the secure link", "Valuables": "Never confirm an item is found until housekeeping has checked" },
      persona: "{name}, the watch was a gift from his late father; worried.",
      behaviour: "Describe the watch and charger. Ask the agent to confirm right now that it's been found. If they say \"yes, it'll be there\" without checking, accept it (trap). Ask for it to be posted and offer to give your card now.",
      targets: ["verification", "kb_facts", "no_card"],
    },
  ],
  drills: [
    /* Level 1 */
    { id: "SD01", title: "Answering the support line", from: "Shared Library greeting rule", guest: "(The phone rings. A guest is waiting for you to speak first.)", was: "Calls were answered with just \"Hello?\" and no hotel name.", task: "Answer the call: your name, the hotel, the recorded line, and how you can help.", targets: ["greeting", "clarity"] },
    { id: "SD02", title: "Before you discuss a booking", from: "Privacy rule", guest: "\"Hi, I'm calling about my sister's booking for next weekend. Can you tell me what room she's in and how much she paid?\"", was: "Booking details were shared before checking who was calling.", task: "Protect the booking without being cold: explain what you can and can't share, and offer a helpful next step.", targets: ["verification", "clarity"] },
    /* Level 2 */
    { id: "SD03", title: "Changing a Booking.com booking", from: "Real call on 4 Nov (OTA booking)", guest: "\"I booked through Booking.com but I need to change the dates. Can you just do it for me?\"", was: "The agent changed details in the hotel system, out of step with the OTA.", task: "Explain that changes go through Booking.com, and say how you'll help.", targets: ["kb_facts", "resolution"] },
    { id: "SD04", title: "Changing the guest name", from: "Common support request", guest: "\"My husband booked the room but he can't come now. Can you put it in my name instead?\"", was: "The name was changed without checking the lead booker agreed.", task: "Verify first, then explain how a name change is approved.", targets: ["verification", "resolution"] },
    /* Level 3 */
    { id: "SD05", title: "Refund on a non-refundable rate", from: "Real call on 27 Oct (cancellation terms muddled)", guest: "\"I booked the cheaper rate but I can't come now. I'd like a full refund please.\"", was: "The agent said \"non-refundable\" and \"tell us 2–3 days before\" in the same call.", task: "Explain the non-refundable terms kindly and clearly, without promising money back, and offer the real next step.", targets: ["empathy", "resolution", "kb_facts"] },
    { id: "SD06", title: "\"Just take my card now\"", from: "Real calls on 4 and 6 Nov (cards read out on the phone)", guest: "\"It's easier if I just read you my card number now. Have you got a pen?\"", was: "Full card details were taken by voice (a PCI breach).", task: "Stop the guest politely before they read it out and offer the secure link.", targets: ["no_card", "clarity"] },
    /* Level 4 */
    { id: "SD07", title: "The heating isn't working", from: "Common in-stay complaint", guest: "\"Our room is freezing. The radiator's stone cold and we've got a baby with us.\"", was: "The guest was told \"someone will look at it tomorrow\".", task: "Show empathy, treat it as urgent because of the baby, and give a clear action and time.", targets: ["empathy", "resolution"] },
    { id: "SD08", title: "\"We booked a sea view\"", from: "Real call on 9 Nov (Portsoy sea-view change \"happens at the property\")", guest: "\"We were promised a sea-view room and we've been put at the back looking at the car park.\"", was: "A sea view was implied as guaranteed when it wasn't.", task: "Check what was actually booked, apologise for the disappointment, and offer only what's possible.", targets: ["empathy", "kb_facts", "resolution"] },
    /* Level 5 */
    { id: "SD09", title: "\"I'm leaving a one-star review\"", from: "Common complaint", guest: "\"Honestly, unless you sort this out I'm putting a one-star review on Google tonight.\"", was: "The agent got defensive and offered a discount to stop the review.", task: "Stay calm, don't bargain over the review, and focus on fixing the problem.", targets: ["empathy", "resolution"] },
    { id: "SD10", title: "\"I want a free night\"", from: "Real call on 9 Nov (champagne promised ad hoc)", guest: "\"After all that, I think the least you can do is give us a free night next time.\"", was: "Free extras were promised without approval.", task: "Acknowledge the request without promising it, and pass it to the person who can decide, with a time.", targets: ["resolution", "escalation"] },
    /* Level 6 */
    { id: "SD11", title: "\"I can smell gas\"", from: "Safety procedure (KB doc I)", guest: "\"There's a strong smell of gas in the corridor on the second floor.\"", was: "Safety calls were handled like normal complaints.", task: "Give clear safety instructions immediately and escalate. No small talk.", targets: ["escalation", "clarity"] },
    { id: "SD12", title: "Company invoice request", from: "Real call on 26 Oct (contractor bookings)", guest: "\"I need a VAT invoice in my company's name for last week's stay, and it has to show all five rooms.\"", was: "The agent promised an invoice format they couldn't produce.", task: "Verify the booking, take the details needed, and pass it to the right team with a time.", targets: ["verification", "escalation", "close"] },
  ],
};

export default pack;
