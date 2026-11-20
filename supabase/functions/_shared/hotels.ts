// Hotel knowledge bases, built from the hotel documents supplied in Nov 2026 (station_hotel_portsoy_knowledge_base_.zip).
// Used by the Customer support course: facts the agent may quote, common questions the KB does NOT answer (gaps),
// and staff cautions. To update: edit the facts here (keep answers exactly as the hotel approves them) and push.

import type { Hotel } from "./types.ts";

const HOTELS: Hotel[] = [
  {
    "id": "station-portsoy",
    "name": "Station Hotel",
    "town": "Portsoy",
    "contact": "22 Seafield Street, Portsoy, Banff AB45 2QT, Scotland | +44 (0)1261 842327 | enquiries@stationhotelportsoy.co.uk",
    "facts": [
      {
        "topic": "Check-in and check-out",
        "answer": "Check-in is from 2:00 pm and check-out is by 11:00 am.",
        "q": "What time is check-in and check-out?"
      },
      {
        "topic": "Early check-in",
        "answer": "Early check-in costs £15, subject to availability. Please contact the hotel in advance if arriving early.",
        "q": "Can we check in early?"
      },
      {
        "topic": "Late check-out",
        "answer": "Late check-out until 1:00 pm costs £15 and must be arranged by phone or at reception.",
        "q": "Can we have a late check-out?"
      },
      {
        "topic": "Reception hours",
        "answer": "Reception is listed as open 24 hours. Phone +44 1261 842327 or email enquiries@stationhotelportsoy.co.uk.",
        "q": "Is reception open overnight?"
      },
      {
        "topic": "Wi-Fi",
        "answer": "Wi-Fi is free. The password is station20.",
        "q": "Do you have Wi-Fi, and what's the password?"
      },
      {
        "topic": "Parking",
        "answer": "Free parking is available at the hotel.",
        "q": "Is there parking at the hotel?"
      },
      {
        "topic": "Rooms and floors",
        "answer": "14 rooms including the Suite. First floor: Rooms 1, 2, 3, 11, 12, 14 and the Suite. Second floor: Rooms 4 to 10.",
        "q": "How many rooms do you have, and on which floors?"
      },
      {
        "topic": "Lift and accessibility",
        "answer": "There is no lift and all guest bedrooms are on the first or second floor. Stair access should be discussed before booking.",
        "q": "Is there a lift or a ground-floor room?"
      },
      {
        "topic": "In-room facilities",
        "answer": "Rooms have a TV, fridge, microwave, toaster and kettle, but availability must be confirmed for the specific room.",
        "q": "Does the room have a fridge or microwave?"
      },
      {
        "topic": "Breakfast price",
        "answer": "Breakfast is £12 per person. Check whether breakfast is already included in the guest's booking before charging.",
        "q": "How much is breakfast, and is it included?"
      },
      {
        "topic": "Breakfast times",
        "answer": "Breakfast is served Monday to Friday 7:00 am to 10:00 am, and Saturday to Sunday 8:00 am to 9:30 am.",
        "q": "What time is breakfast served?"
      },
      {
        "topic": "Lunch times",
        "answer": "Lunch is Monday to Wednesday 12:00 pm to 3:00 pm, Friday to Sunday 12:00 pm to 2:00 pm. There is no lunch service on Thursday.",
        "q": "Do you serve lunch?"
      },
      {
        "topic": "Dinner",
        "answer": "Dinner is Monday to Wednesday 5:00 pm to 8:30 pm, Friday to Sunday 5:00 pm to 8:00 pm; no dinner on Thursday. Guide price £25 per person (confirm current menu).",
        "q": "What time is dinner, and how much is it?"
      },
      {
        "topic": "Bar hours (Sunday to Wednesday)",
        "answer": "The bar is open 11:00 am to 11:00 pm Monday to Wednesday and on Sunday. Confirm with reception.",
        "q": "What time does the bar open and close?"
      },
      {
        "topic": "Bar hours (Thursday to Saturday)",
        "answer": "Thursday supplied as 11:00 am to 12:00 pm, Friday and Saturday as 11:00 am to 1:00 pm. Both closing times are ambiguous; verify with management before telling a guest.",
        "q": "How late is the bar open on Friday night?"
      },
      {
        "topic": "Hotel facilities",
        "answer": "On site there is a restaurant, a bar, a coffee shop and a function hall.",
        "q": "What facilities does the hotel have?"
      },
      {
        "topic": "Nearest bus stop",
        "answer": "The nearest bus stop is on Seafield Street, about 1 minute on foot. Check the service and direction.",
        "q": "Where's the nearest bus stop?"
      },
      {
        "topic": "Nearest railway station",
        "answer": "Portsoy has no passenger railway station. The nearest mainline station is Keith, about 16 miles (26 km), around 22 minutes by car or taxi.",
        "q": "What's the nearest train station?"
      },
      {
        "topic": "Huntly station",
        "answer": "Huntly railway station is about 18 miles (29 km) by road, around 24 minutes by car or taxi.",
        "q": "How far is Huntly station?"
      },
      {
        "topic": "Airports",
        "answer": "Aberdeen International Airport is about 1 hour 5 minutes by car; Inverness Airport is about 1 hour 25 minutes. Both are traffic dependent.",
        "q": "How far are you from the airport?"
      },
      {
        "topic": "Portsoy Harbour",
        "answer": "Portsoy Harbour is a historic harbour with coastal views, about 7 to 10 minutes on foot.",
        "q": "How far is the harbour?"
      },
      {
        "topic": "The Salmon Bothy",
        "answer": "The Salmon Bothy is a local heritage attraction about 9 to 12 minutes on foot. Check opening times.",
        "q": "Is there a museum or heritage site nearby?"
      },
      {
        "topic": "Findlater Castle",
        "answer": "Findlater Castle is a dramatic set of coastal castle ruins, about 8 to 12 minutes by car plus a walk. Warn guests about hazardous cliffs.",
        "q": "Is Findlater Castle worth visiting?"
      },
      {
        "topic": "Beaches",
        "answer": "Sandend Beach is about 5 minutes by car; Cullen Beach is about 9 to 15 minutes by car.",
        "q": "Is there a nice beach nearby?"
      },
      {
        "topic": "Bow Fiddle Rock",
        "answer": "Bow Fiddle Rock, a distinctive sea arch at Portknockie, is about 14 to 20 minutes by car.",
        "q": "How far is Bow Fiddle Rock?"
      },
      {
        "topic": "Places to eat nearby",
        "answer": "Hook, Line and Sinker fish and chips (1 to 3 minutes' walk), The Shore Inn pub (3 to 6 minutes) and Aspire Restaurant (2 to 5 minutes). Check they are open.",
        "q": "Where can we eat nearby?"
      },
      {
        "topic": "Cafés nearby",
        "answer": "Portsoy Ice Cream (1 to 3 minutes' walk), Portsoy Coffee Shop (2 to 5 minutes) and SYMPOSIUM coffee house, a short town-centre walk.",
        "q": "Is there a café nearby?"
      },
      {
        "topic": "Local events",
        "answer": "Portsoy Christmas Market is on 14 November 2026, 1 to 6 pm at Portsoy Church Centre. Portsoy 75 Club Family Bingo is on 26 November 2026; confirm venue with organiser.",
        "q": "What's on in Portsoy this month?"
      },
      {
        "topic": "Boat festival",
        "answer": "The Scottish Traditional Boat Festival is at Portsoy Harbour in June 2027; exact dates are not yet confirmed.",
        "q": "When is the boat festival?"
      },
      {
        "topic": "Emergency",
        "answer": "For immediate danger or a medical, fire or police emergency, call 999 or 112, giving the hotel name, location and clear details.",
        "q": "What do I do in an emergency?"
      },
      {
        "topic": "Non-emergency medical help",
        "answer": "For urgent medical advice that is not life-threatening, contact NHS 24 on 111. Verify the nearest open pharmacy or clinic.",
        "q": "I need a doctor, but it's not an emergency."
      },
      {
        "topic": "Lost property",
        "answer": "Record the item description, room number, contact details and date, check the hotel lost-property procedure, then update the guest.",
        "q": "I think I left something in my room."
      },
      {
        "topic": "Noise or maintenance",
        "answer": "Apologise, record the issue and room number, contact the responsible team and offer an update or alternative, subject to hotel policy.",
        "q": "There's a problem with my room. Can you help?"
      },
      {
        "topic": "Coastal safety",
        "answer": "Guests should follow official weather warnings, stay clear of exposed harbour edges and rough seas, and avoid risky coastal routes.",
        "q": "Is it safe to walk the coast today?"
      }
    ],
    "gaps": [
      {
        "topic": "Dogs",
        "q": "Can we bring our dog?"
      },
      {
        "topic": "Children and cots",
        "q": "Do you have a cot for our baby?"
      },
      {
        "topic": "Smoking",
        "q": "Can I smoke in my room?"
      },
      {
        "topic": "Luggage storage",
        "q": "Can we leave our bags after check-out?"
      },
      {
        "topic": "Cancellation policy",
        "q": "What's your cancellation policy?"
      },
      {
        "topic": "EV charging",
        "q": "Do you have an electric car charger?"
      },
      {
        "topic": "Room service",
        "q": "Can we order food to the room?"
      }
    ],
    "cautions": [
      "Do not promise a ground-floor room or step-free bedroom access: all bedrooms are on the first or second floor and there is no lift.",
      "Never interpret the Thursday, Friday or Saturday bar closing times as midnight or 1:00 am without management confirmation.",
      "Confirm which rooms actually have a fridge, microwave and toaster before promising them.",
      "Check whether breakfast is included in the guest's rate before charging £12.",
      "The £25 dinner price is a guide price; confirm inclusions and current menu.",
      "Reception is listed as 24 hours, but staffing arrangements should be verified internally.",
      "Hotel hours, prices and room assignments were supplied by staff and not independently verified; confirm changes with management.",
      "Event dates (bingo venue, 2027 festivals) are TBC; check the organiser before advising guests."
    ]
  },
  {
    "id": "central-gloucester",
    "name": "Central Hotel",
    "town": "Gloucester",
    "contact": "14–18 Clarence Street, Gloucester, GL1 1EA | 01452 311813 (hotel assistance); +44 12425 82172 (main contact as listed, verify) | homeslystays2026@gmail.com",
    "facts": [
      {
        "topic": "Check-in and check-out",
        "answer": "Check-in is at 2:00 PM and check-out is at 10:00 AM.",
        "q": "What time is check-in and check-out?"
      },
      {
        "topic": "Early check-in",
        "answer": "Early check-in is £15, subject to availability.",
        "q": "Can we check in early?"
      },
      {
        "topic": "Late check-out",
        "answer": "Late check-out until 1:00 PM is £15 and must be arranged by phone or at reception.",
        "q": "Can we check out late?"
      },
      {
        "topic": "Reception hours",
        "answer": "Reception is open 24 hours. Hotel assistance: 01452 311813.",
        "q": "Is reception open all night?"
      },
      {
        "topic": "Main contact number",
        "answer": "The guest diary lists +44 12425 82172 as the main contact, but it must be verified. Hotel assistance is 01452 311813.",
        "q": "What's the hotel's phone number?"
      },
      {
        "topic": "Email",
        "answer": "The hotel email is homeslystays2026@gmail.com.",
        "q": "What email address can I use?"
      },
      {
        "topic": "Wi-Fi",
        "answer": "Wi-Fi network is Roomsbooked and the password is pa55roomb.",
        "q": "What's the Wi-Fi password?"
      },
      {
        "topic": "Food and drink",
        "answer": "The hotel does not provide breakfast, dinner, a restaurant or a bar. Offer nearby options after checking what is open.",
        "q": "Is breakfast included?"
      },
      {
        "topic": "Pets",
        "answer": "Pets are not permitted.",
        "q": "Can we bring our dog?"
      },
      {
        "topic": "Housekeeping",
        "answer": "Housekeeping is 10:00 AM to 3:00 PM. Multi-night guests should allow daily access.",
        "q": "When does housekeeping clean the room?"
      },
      {
        "topic": "Smoking and vaping",
        "answer": "Smoking and vaping are not permitted inside rooms. A £100 charge applies for smoking or vaping in a room.",
        "q": "Can I smoke or vape in my room?"
      },
      {
        "topic": "Parking",
        "answer": "There is no hotel parking. Nearby public parking includes Kings Walk; check current charges and restrictions.",
        "q": "Is there parking at the hotel?"
      },
      {
        "topic": "Accessibility",
        "answer": "Accessible/disabled rooms are available. Contact reception for assistance.",
        "q": "Do you have accessible rooms?"
      },
      {
        "topic": "Room and floor guide",
        "answer": "Ground 001–014; Upper Ground 015–020; First 101–109; Upper First 110–116; Second 201–209; Upper Second 210–216; Third 301–310; Upper Third 311–317.",
        "q": "Which floor is my room on?"
      },
      {
        "topic": "Fire safety",
        "answer": "Follow the fire-safety information in the room and contact reception if unsure.",
        "q": "What do we do if the fire alarm goes off?"
      },
      {
        "topic": "Railway and bus station",
        "answer": "Gloucester Railway Station on Bruton Way and the bus station are about a five-minute walk. Allow extra time with luggage.",
        "q": "How far is the train station?"
      },
      {
        "topic": "Bus and coach",
        "answer": "Gloucester Transport Hub, the main bus and coach interchange, is close to the railway station. Check current services before travel.",
        "q": "Where do the coaches leave from?"
      },
      {
        "topic": "Taxis",
        "answer": "Reception can help identify current taxi options. Confirm operator, estimated fare, pickup point and availability before recommending one.",
        "q": "Can you get us a taxi?"
      },
      {
        "topic": "Gloucester Cathedral",
        "answer": "Gloucester Cathedral has medieval architecture, stained glass and cloisters. Services and special events can affect visitor access.",
        "q": "Is the cathedral worth a visit?"
      },
      {
        "topic": "Gloucester Docks",
        "answer": "The historic docks have restored warehouses, waterfront walks, museums, cafés and restaurants, plus the National Waterways Museum and Soldiers of Gloucestershire Museum.",
        "q": "What's there to do at the docks?"
      },
      {
        "topic": "Gloucester Quays",
        "answer": "Gloucester Quays has outlet shopping, food and drink, seasonal markets and events. Check retail and event hours.",
        "q": "Where's good for shopping?"
      },
      {
        "topic": "Museum of Gloucester",
        "answer": "The Museum of Gloucester covers local history, Roman origins and changing exhibitions. Check current opening days.",
        "q": "Is there a museum in town?"
      },
      {
        "topic": "Places to eat on the docks",
        "answer": "Gloucester Food Dock (several independent vendors), Trattoria Settebello (Italian) and Greek on the Docks. Check menus and opening hours.",
        "q": "Can you recommend somewhere to eat?"
      },
      {
        "topic": "Pubs",
        "answer": "Dr Foster is a pub and restaurant in a dockside warehouse; Café René is a city-centre pub with live music on selected evenings.",
        "q": "Is there a good pub nearby?"
      },
      {
        "topic": "Shopping and essentials",
        "answer": "Kings Walk Shopping Centre and Gloucester High Street are central. For pharmacies and supermarkets, check the nearest currently open option.",
        "q": "Is there a pharmacy or supermarket nearby?"
      },
      {
        "topic": "Christmas events",
        "answer": "Gloucester Quays holds Christmas markets and festive activities in November and December. Expect weekend crowds; verify dates on the official listing.",
        "q": "Are there any Christmas markets on?"
      },
      {
        "topic": "Rugby match days",
        "answer": "Gloucester Rugby plays at Kingsholm Stadium. Match days can affect traffic, public transport, pubs and restaurant demand.",
        "q": "Is there a rugby match this weekend?"
      },
      {
        "topic": "Emergency",
        "answer": "For an immediate threat to life or serious emergency, call 999.",
        "q": "What do I do in an emergency?"
      },
      {
        "topic": "Non-emergency medical help",
        "answer": "For urgent but non-life-threatening medical advice, NHS 111 can direct guests to the right service. Check NHS listings before naming a pharmacy or hospital.",
        "q": "I feel unwell. Who should I call?"
      },
      {
        "topic": "Dietary needs",
        "answer": "Ask about vegetarian, vegan, halal, gluten-free or allergy needs. Never guarantee allergy safety without checking directly with the venue.",
        "q": "Where can I get gluten-free food nearby?"
      }
    ],
    "gaps": [
      {
        "topic": "Lift",
        "q": "Is there a lift to the upper floors?"
      },
      {
        "topic": "Luggage storage",
        "q": "Can we leave our bags after check-out?"
      },
      {
        "topic": "Cots",
        "q": "Can you provide a cot for our baby?"
      },
      {
        "topic": "Cancellation policy",
        "q": "What happens if I need to cancel?"
      },
      {
        "topic": "Airport transfer",
        "q": "Do you offer an airport transfer?"
      },
      {
        "topic": "EV charging",
        "q": "Is there anywhere to charge my electric car?"
      },
      {
        "topic": "Lost property",
        "q": "I left my charger behind. Have you found it?"
      },
      {
        "topic": "Laundry",
        "q": "Is there a laundry service?"
      }
    ],
    "cautions": [
      "Do not promise early check-in, late check-out, parking spaces or accessibility arrangements until availability and current terms are confirmed.",
      "The main contact number +44 12425 82172 is flagged as needing verification; use 01452 311813 for hotel assistance.",
      "The hotel has no breakfast, restaurant or bar: never offer meals on site.",
      "There is no hotel parking; do not promise a space at Kings Walk or quote charges without checking.",
      "Separate confirmed hotel policy from external information; verify event dates, opening hours, transport and medical services before advising.",
      "Never guarantee allergy safety at any restaurant."
    ]
  },
  {
    "id": "hampton-llandrindod",
    "name": "Hampton Hotel",
    "town": "Llandrindod Wells",
    "contact": "Temple Street, Llandrindod Wells, LD1 5HF | phone not listed | support@thehamptonhotel.co.uk",
    "facts": [
      {
        "topic": "Check-in",
        "answer": "Standard check-in is from 3:00 PM, available until 11:00 PM.",
        "q": "What time can we check in?"
      },
      {
        "topic": "Check-out",
        "answer": "Check-out is by 11:00 AM.",
        "q": "What time is check-out?"
      },
      {
        "topic": "Parking",
        "answer": "Free on-site parking for resident guests, first-come, first-served and subject to availability.",
        "q": "Is there parking at the hotel?"
      },
      {
        "topic": "Wi-Fi",
        "answer": "Complimentary high-speed Wi-Fi is provided throughout the hotel.",
        "q": "Do you have Wi-Fi?"
      },
      {
        "topic": "Dogs",
        "answer": "Well-behaved dogs are welcome. A charge of £15 per night applies.",
        "q": "Can we bring our dog?"
      },
      {
        "topic": "In-room facilities",
        "answer": "Every room has a flat-screen TV, electric kettle, tea and coffee making facilities, wardrobe, desk and private en-suite bathroom.",
        "q": "What's in the rooms?"
      },
      {
        "topic": "Rooms and floors",
        "answer": "Rooms 1 to 16 are on the First Floor and Rooms 23 to 30 are on the Second Floor.",
        "q": "Which floor are the rooms on?"
      },
      {
        "topic": "Room types",
        "answer": "Standard Double, Standard Twin, Superior King, Single and Family Rooms. Doubles, twins and kings sleep 2 adults; singles sleep 1 adult.",
        "q": "What types of room do you have?"
      },
      {
        "topic": "Family rooms",
        "answer": "Rooms 16 and 30 are Family Rooms, with one double bed and one single bed.",
        "q": "Do you have a family room?"
      },
      {
        "topic": "Single rooms",
        "answer": "Rooms 5, 10, 15 and 27 are Single Rooms for 1 adult with one single bed.",
        "q": "Do you have single rooms?"
      },
      {
        "topic": "Superior King rooms",
        "answer": "Rooms 3, 8, 13, 24 and 28 are Superior King Rooms with one king bed for 2 adults.",
        "q": "Do you have a room with a king-size bed?"
      },
      {
        "topic": "Twin rooms",
        "answer": "Rooms 2, 7, 12 and 25 are Standard Twin Rooms with two twin beds for 2 adults.",
        "q": "Can we get a twin room?"
      },
      {
        "topic": "Breakfast times",
        "answer": "A continental breakfast is served daily from 7:30 AM to 9:30 AM in the on-site dining area.",
        "q": "What time is breakfast?"
      },
      {
        "topic": "Breakfast menu",
        "answer": "Pastries, croissants, breads, butter and preserves, cereals, yogurts and fresh fruit, with filter coffee, Welsh tea, herbal teas and chilled fruit juices.",
        "q": "What's served for breakfast?"
      },
      {
        "topic": "Railway station",
        "answer": "Llandrindod Railway Station on Station Crescent is a 5-minute walk (about 400 m), on the Heart of Wales Line with direct trains between Swansea and Shrewsbury.",
        "q": "How far is the train station?"
      },
      {
        "topic": "Buses",
        "answer": "Llandrindod Wells Bus Station and Temple Street stops are a 2 to 4 minute walk, with routes to Builth Wells, Rhayader, Newtown and Brecon.",
        "q": "Where can we catch a bus?"
      },
      {
        "topic": "Driving",
        "answer": "The A483, the main north–south route through Mid Wales, is a 1-minute drive away.",
        "q": "How do we get there by car?"
      },
      {
        "topic": "Llandrindod Wells Lake",
        "answer": "The town lake in Lake Park is ideal for walking, cycling, fishing and picnics, with hill views. Good for families.",
        "q": "Is there somewhere nice to walk?"
      },
      {
        "topic": "Rock Park",
        "answer": "Rock Park is a historic park beside the River Ithon with mature trees, walking trails and Victorian spa heritage.",
        "q": "What is Rock Park like?"
      },
      {
        "topic": "National Cycle Museum",
        "answer": "The National Cycle Museum at the Automobile Palace, Temple Street, has an extensive collection of historic bicycles.",
        "q": "Is there a museum nearby?"
      },
      {
        "topic": "Radnorshire Museum",
        "answer": "Radnorshire Museum in the town centre covers local history and heritage through artefacts, art and exhibitions.",
        "q": "Is there a local history museum?"
      },
      {
        "topic": "The Albert Hall",
        "answer": "The Albert Hall on Ithon Road is a Victorian theatre from 1896 hosting live performances, concerts, cinema and local arts events.",
        "q": "Is there a theatre or cinema in town?"
      },
      {
        "topic": "Heritage Trail",
        "answer": "The Llandrindod Heritage Trail is a self-guided town-centre walk covering Victorian architecture, parks, the lake and spa-town origins.",
        "q": "Is there a walking tour of the town?"
      }
    ],
    "gaps": [
      {
        "topic": "Dinner",
        "q": "Do you serve evening meals?"
      },
      {
        "topic": "Breakfast price",
        "q": "Is breakfast included in the room rate?"
      },
      {
        "topic": "Wi-Fi password",
        "q": "What's the Wi-Fi password?"
      },
      {
        "topic": "Lift",
        "q": "Is there a lift to the second floor?"
      },
      {
        "topic": "Smoking",
        "q": "Can I smoke in my room?"
      },
      {
        "topic": "Late check-out",
        "q": "Can we check out late?"
      },
      {
        "topic": "Cots",
        "q": "Can you put a cot in our room?"
      },
      {
        "topic": "Emergency and medical",
        "q": "Where's the nearest hospital?"
      }
    ],
    "cautions": [
      "The guide says 22 bedrooms, but the room list shows 24 rooms (1–16 and 23–30); confirm the room count before quoting it.",
      "All listed rooms are on the First and Second Floors and no lift is mentioned; do not promise ground-floor or step-free access.",
      "No hotel phone number is listed, only support@thehamptonhotel.co.uk; arrival is described as 'Keyless / Reception Desk' without detail, so confirm arrival arrangements.",
      "No bar is described for this hotel (document titled 'No Bar'); do not offer bar service.",
      "Parking is first-come, first-served and cannot be guaranteed.",
      "The KB does not say whether breakfast is included or what it costs; check the booking."
    ]
  },
  {
    "id": "homesly-berwick",
    "name": "Homesly Guest Rooms",
    "town": "Berwick-upon-Tweed",
    "contact": "Address not supplied (confirm with management) | phone not supplied | email not supplied",
    "facts": [
      {
        "topic": "Rooms and capacity",
        "answer": "There are 9 guest rooms with a stated total capacity of 29 guests. Individual room occupancy limits have not been provided.",
        "q": "How many people can you sleep?"
      },
      {
        "topic": "Check-in",
        "answer": "Standard check-in is from 4:00 PM.",
        "q": "What time can we check in?"
      },
      {
        "topic": "Check-out",
        "answer": "Check-out was supplied as 10:00 PM, which may be a typo for 10:00 AM. Verify with the team before telling a guest.",
        "q": "What time do we need to check out?"
      },
      {
        "topic": "Early check-in at 3 PM",
        "answer": "Early check-in at 3:00 PM is free of charge, subject to confirmation and availability.",
        "q": "Can we arrive at 3 o'clock?"
      },
      {
        "topic": "Early check-in from midday",
        "answer": "Early check-in between 12:00 PM and 3:00 PM costs £30 and must be arranged with the property in advance.",
        "q": "Can we check in around lunchtime?"
      },
      {
        "topic": "Late check-out",
        "answer": "Late check-out is not specified; the guest must contact the property for approval.",
        "q": "Can we check out late?"
      },
      {
        "topic": "Breakfast",
        "answer": "Breakfast is not provided. Guests can use the in-room kettle, toaster, microwave and refrigerator, or cafés around Marygate, Bridge Street, Hide Hill and Walkergate.",
        "q": "Is breakfast included?"
      },
      {
        "topic": "Wi-Fi",
        "answer": "Wi-Fi is free. The password is Cxaq6RGVMG3ghv.",
        "q": "What's the Wi-Fi password?"
      },
      {
        "topic": "Smoking",
        "answer": "No. All rooms are non-smoking.",
        "q": "Can I smoke in my room?"
      },
      {
        "topic": "On-site parking",
        "answer": "There are 3 free on-site spaces, first come, first served. Spaces cannot be guaranteed or reserved.",
        "q": "Is there parking?"
      },
      {
        "topic": "Coxon's Lane car park",
        "answer": "Coxon's Lane public car park, Coxons Ln, TD15 1DD, is reported about 100 m away. Confirm route, charges and restrictions.",
        "q": "Where else can we park?"
      },
      {
        "topic": "Hatters Lane parking",
        "answer": "Hatters Lane public parking, Hatters Ln, TD15 1BY, is reported less than a 1-minute walk away. Confirm charges and restrictions.",
        "q": "Is there public parking close by?"
      },
      {
        "topic": "In-room amenities",
        "answer": "Every room has a kettle, toaster, microwave, cookies, tea and coffee, cups, extra bedding, hair dryer, refrigerator, flat-screen TV and heating.",
        "q": "What's in the room?"
      },
      {
        "topic": "Cooking facilities",
        "answer": "Rooms have a microwave, toaster, kettle and refrigerator; no hob or full kitchen has been confirmed.",
        "q": "Can we cook in the room?"
      },
      {
        "topic": "Railway station",
        "answer": "Berwick-upon-Tweed station is on the East Coast Main Line. Exact distance from the property is not known; use a live map and check train times.",
        "q": "How far is the train station?"
      },
      {
        "topic": "Buses",
        "answer": "Local and regional bus services operate in Berwick. Confirm the closest stop and current timetable before advising.",
        "q": "Is there a bus nearby?"
      },
      {
        "topic": "Taxis",
        "answer": "Taxis should be arranged through a licensed local operator; confirm pickup point, fare and availability.",
        "q": "Can you book us a taxi?"
      },
      {
        "topic": "Walking around town",
        "answer": "Central Berwick sights can be explored on foot, but some routes include hills, steps and uneven historic surfaces.",
        "q": "Can we walk into town?"
      },
      {
        "topic": "Elizabethan Town Walls",
        "answer": "The historic walls offer views over the town and coast; allow roughly 45 to 60 minutes for a relaxed walk.",
        "q": "What should we see in Berwick?"
      },
      {
        "topic": "Castle and Ramparts",
        "answer": "Berwick Castle remains and ramparts are historic fortifications; watch for steep drops and uneven paths.",
        "q": "Can we visit the castle?"
      },
      {
        "topic": "Three bridges",
        "answer": "The River Tweed and its three bridges, including the Royal Border Bridge, are good for riverside views and photography.",
        "q": "Where's good for photos?"
      },
      {
        "topic": "Spittal Beach",
        "answer": "Spittal Beach and Promenade is a coastal outing; check weather, tides and swimming conditions.",
        "q": "Is there a beach nearby?"
      },
      {
        "topic": "Lindisfarne / Holy Island",
        "answer": "Lindisfarne is a popular day trip, but tidal causeway crossing times must be checked carefully.",
        "q": "Can we visit Holy Island?"
      },
      {
        "topic": "Berwick Barracks",
        "answer": "Berwick Barracks is undergoing redevelopment; the main barracks reopening is currently planned for autumn 2027.",
        "q": "Is the Barracks open?"
      },
      {
        "topic": "Tourist information",
        "answer": "Berwick Tourist Information Centre, Walkergate, TD15 1DB, can help with local recommendations.",
        "q": "Where's the tourist information office?"
      },
      {
        "topic": "Events",
        "answer": "Events include the Berwick Film & Media Arts Festival, Literary Festival, Heritage Open Days and food festivals; dates must be verified for the year of travel.",
        "q": "Are there any festivals on?"
      },
      {
        "topic": "Emergency and police",
        "answer": "For immediate danger or emergencies, call 999. For non-emergency police assistance, call 101.",
        "q": "What number do I call in an emergency?"
      },
      {
        "topic": "Non-emergency medical help",
        "answer": "For urgent medical advice that is not life-threatening, use NHS 111.",
        "q": "I need medical advice. Who do I call?"
      },
      {
        "topic": "Lost property and faults",
        "answer": "Guests should contact the property team for lost property, faulty appliances, heating, Wi-Fi or access issues. Do not promise a response time.",
        "q": "The heating isn't working. What do I do?"
      }
    ],
    "gaps": [
      {
        "topic": "Dogs",
        "q": "Can we bring our dog?"
      },
      {
        "topic": "Cots and children",
        "q": "Do you have a cot for a baby?"
      },
      {
        "topic": "Stairs and accessibility",
        "q": "Are there stairs, or a ground-floor room?"
      },
      {
        "topic": "Luggage storage",
        "q": "Can we leave our bags with you?"
      },
      {
        "topic": "Cancellation policy",
        "q": "Can I cancel my booking for free?"
      },
      {
        "topic": "EV charging",
        "q": "Can I charge my electric car?"
      },
      {
        "topic": "Housekeeping",
        "q": "Will the room be cleaned during our stay?"
      }
    ],
    "cautions": [
      "Check-out was supplied as 10:00 PM, which may be a typo for 10:00 AM; confirm before advising any guest.",
      "Property address and guest support contact were not supplied; do not quote walking distances or a street address.",
      "Do not guarantee early check-in; it is unclear whether the free 3:00 PM option is always available or depends on room readiness.",
      "Parking is limited to 3 spaces and non-reservable unless management approves otherwise.",
      "Accessibility and stairs information was not supplied; verify before answering mobility questions.",
      "Confirm the booking name and reservation details before sharing room or access information.",
      "Housekeeping, late check-out and luggage policies are not supplied; escalate rather than guess."
    ]
  },
  {
    "id": "george-montrose",
    "name": "George Hotel",
    "town": "Montrose",
    "contact": "22 George Street, Montrose, Angus, DD10 8EW | 01674 675050 (+44 1674 675050); WhatsApp +44 7488 889964 | reception@thegeorge-montrose.co.uk",
    "facts": [
      {
        "topic": "Check-in and check-out",
        "answer": "Check-in is from 2:00 pm until 11:00 pm; check-out is by 11:00 am. The newer guide lists these as unconfirmed, so verify with management.",
        "q": "What time is check-in and check-out?"
      },
      {
        "topic": "Late arrival",
        "answer": "Arriving after 11 pm, guests should let reception know in advance on 01674 675050. The front desk is open 24 hours.",
        "q": "We'll arrive after midnight. Is that okay?"
      },
      {
        "topic": "Early check-in and late check-out",
        "answer": "Can be requested, subject to availability, and may carry an extra charge. The fee and timing are not specified; confirm before promising.",
        "q": "Can we check in early or leave late?"
      },
      {
        "topic": "Front desk",
        "answer": "The front desk is open 24 hours. Phone 01674 675050, or WhatsApp +44 7488 889964.",
        "q": "Is reception open 24 hours?"
      },
      {
        "topic": "Wi-Fi",
        "answer": "Free Wi-Fi is available. Network: Hotel. Password: george123. Share with registered guests.",
        "q": "What's the Wi-Fi password?"
      },
      {
        "topic": "Parking",
        "answer": "Free on-site parking next to the hotel, first-come, first-served and subject to availability. A space cannot be guaranteed.",
        "q": "Is there parking at the hotel?"
      },
      {
        "topic": "Rooms",
        "answer": "25 rooms: 5 Double, 5 Double/Twin, 13 Single, 1 Twin and 1 Family Room. All are en-suite.",
        "q": "What kinds of rooms do you have?"
      },
      {
        "topic": "Family room",
        "answer": "There is one Family Room with 2 double beds, sleeping up to 4 guests. It books up quickly.",
        "q": "Do you have a family room for four?"
      },
      {
        "topic": "In-room facilities",
        "answer": "Private bathroom, TV, hairdryer, free toiletries and a tea tray with Tetley tea, Nescafé coffee, milk and biscuits. Iron and ironing board on request.",
        "q": "What's in the room?"
      },
      {
        "topic": "Room prices",
        "answer": "Guide prices for November 2026, room only, per night: single from £77, double from £90, twin from £95, family room from £136. Always say 'from'.",
        "q": "How much is a double room?"
      },
      {
        "topic": "Advance Purchase rate",
        "answer": "Advance Purchase is about 10% off and non-refundable: payment is taken at booking with no changes, cancellations or refunds.",
        "q": "Is there a cheaper rate?"
      },
      {
        "topic": "Payment",
        "answer": "Bookings must be fully prepaid online. Cash and pay on arrival are not accepted. Visa, Mastercard, American Express and Discover are accepted.",
        "q": "Can I pay when I arrive?"
      },
      {
        "topic": "Cancellation",
        "answer": "Flexible rates can be cancelled free until the deadline in the confirmation (for example 48 hours before arrival); after that, or for no-shows, the full price is charged.",
        "q": "How do I cancel my booking?"
      },
      {
        "topic": "Refunds and damage deposit",
        "answer": "Refunds go to the original payment method within 5–7 business days. A refundable damage deposit may be taken and released within 7 days after check-out.",
        "q": "When will I get my deposit back?"
      },
      {
        "topic": "Third-party bookings",
        "answer": "Bookings via Booking.com, Expedia or other sites follow that site's terms. Use the booking site or contact reception with the booking reference.",
        "q": "I booked on Booking.com. Can you change it?"
      },
      {
        "topic": "Breakfast",
        "answer": "Breakfast is Monday to Saturday 7:00–9:45 am, Sunday 8:00–9:45 am: cooked breakfast plus continental buffet. Not included in room-only rates; ask reception for the price.",
        "q": "Is breakfast included, and what time?"
      },
      {
        "topic": "Restaurant times",
        "answer": "Monday to Thursday 12:00–2:00 pm and 5:00–8:30 pm; Friday to Sunday 12:00–8:30 pm (last orders). Family-friendly, Scottish cuisine.",
        "q": "What time is the restaurant open?"
      },
      {
        "topic": "Table booking",
        "answer": "Booking is recommended; call 01674 675050 for same-day tables. Non-residents welcome. Deposits are taken for tables of more than 10.",
        "q": "Can I book a table for dinner?"
      },
      {
        "topic": "High tea",
        "answer": "High tea is £19.75 per person; children's high tea £12.95. Served Monday to Thursday 5–7 pm, Friday to Sunday 4–7 pm.",
        "q": "Do you do afternoon or high tea?"
      },
      {
        "topic": "Dietary needs",
        "answer": "Vegetarian, vegan and gluten-free options are listed; confirm current menu. Guests should tell staff about any allergies when ordering.",
        "q": "Do you cater for vegans or gluten-free?"
      },
      {
        "topic": "Dogs",
        "answer": "Dogs are welcome in the room for £10 per night and in the Bar Lounge. Mention the dog when booking.",
        "q": "Can we bring our dog?"
      },
      {
        "topic": "Children and cots",
        "answer": "Children of all ages are welcome. For cots or extra beds, ask reception before booking.",
        "q": "Can you provide a cot?"
      },
      {
        "topic": "Smoking",
        "answer": "Smoking is not allowed anywhere indoors; a £150 fine applies. Designated outdoor smoking areas are provided.",
        "q": "Can I smoke in my room?"
      },
      {
        "topic": "Quiet hours and age",
        "answer": "Quiet hours are 10:00 pm to 7:00 am. The lead guest must be 18 or over, and only registered guests may stay in rooms.",
        "q": "Are there any house rules?"
      },
      {
        "topic": "Accessibility",
        "answer": "Detailed accessibility features are not specified. Guests should contact reception before booking so the team can advise on the most suitable room.",
        "q": "Do you have an accessible room?"
      },
      {
        "topic": "Room service, laundry and shuttle",
        "answer": "Room service, laundry facilities and an airport shuttle are listed, but availability, hours, routes and charges must be confirmed.",
        "q": "Do you offer an airport shuttle?"
      },
      {
        "topic": "Functions and weddings",
        "answer": "The Garden Room, with private garden and bar, hosts up to 100 people for weddings, parties, funeral teas and meetings. Prices quoted per event; deposits taken.",
        "q": "Can we hold a party at the hotel?"
      },
      {
        "topic": "Golf breaks",
        "answer": "Golf packages for solo golfers, couples and groups of 3+ at Montrose Golf Links (Broomfield and 1562 courses). Prices vary; contact reception for a quote.",
        "q": "Do you offer golf packages?"
      },
      {
        "topic": "Railway station",
        "answer": "Montrose station, Basin View, DD10 8LW, is a short walk away, with step-free platform access, lifts and passenger assistance. Check exact time on a live map.",
        "q": "How far is the train station?"
      },
      {
        "topic": "Beach and Montrose Basin",
        "answer": "Montrose Beach (about 1 mile) has three miles of sand and a promenade. Montrose Basin Nature Reserve (about 2 miles) is great for birdwatching.",
        "q": "What is there to do nearby?"
      },
      {
        "topic": "Museums and heritage",
        "answer": "Montrose Air Station Museum is about 2 miles; House of Dun about 4 miles; Montrose Museum & Art Gallery about 0.3 mile. Check opening days.",
        "q": "Are there any museums nearby?"
      },
      {
        "topic": "Places to eat nearby",
        "answer": "Park Hotel – Parkers Restaurant (01674 663400), The Links Hotel (01674 671000) and Hillside Hotel & Restaurant (01674 830230). Confirm hours.",
        "q": "Can you recommend another restaurant in town?"
      },
      {
        "topic": "Emergency and medical",
        "answer": "For emergencies, call 999. For urgent but non-life-threatening medical advice in Scotland, contact NHS 24 on 111.",
        "q": "Who do I call if I feel unwell?"
      },
      {
        "topic": "Complaints",
        "answer": "Guests should speak to reception or email reception@thegeorge-montrose.co.uk, and the Hotel Manager, Tracy Park, will follow up.",
        "q": "I'd like to make a complaint."
      }
    ],
    "gaps": [
      {
        "topic": "EV charging",
        "q": "Do you have an electric car charger?"
      },
      {
        "topic": "Luggage storage",
        "q": "Can we leave our bags after check-out?"
      },
      {
        "topic": "Lift",
        "q": "Is there a lift in the hotel?"
      },
      {
        "topic": "Breakfast price",
        "q": "How much is breakfast?"
      },
      {
        "topic": "Nearest airport",
        "q": "Which airport is nearest, and how far?"
      },
      {
        "topic": "Lost property",
        "q": "I left my glasses in the room. Have you found them?"
      },
      {
        "topic": "Bar hours",
        "q": "What time does the bar close?"
      }
    ],
    "cautions": [
      "Never promise a room price: say 'from' and point to the booking page or reception.",
      "Do not guarantee a parking space: on-site parking is first-come, first-served.",
      "Check-in/out times, the dog policy and the email address come from the older KB; the newer guide marks them as unconfirmed, so verify before promising.",
      "Do not promise room type, early check-in, late check-out, airport transfers, room service or accessibility arrangements until confirmed.",
      "Advance Purchase rates are non-refundable; do not suggest they can be cancelled or changed.",
      "Share the Wi-Fi password only with registered guests, and do not disclose internal-only information to non-guests.",
      "Lunan Bay distance conflicts (31 miles in hotel KB vs about 6 miles in guest guide); verify before quoting.",
      "Scurdie Ness Lighthouse tower is not open to the public; do not advise entering closed areas at Red Castle."
    ]
  },
  {
    "id": "coach-house-otterburn",
    "name": "Coach House",
    "town": "Otterburn",
    "contact": "Otterburn Hall Estate, Otterburn, Northumberland, NE19 1HE | +44 (0) 1830 520803 | bookings@coachhouseotterburn.co.uk",
    "facts": [
      {
        "topic": "Check-in and check-out",
        "answer": "Check-in is 3:00 PM to 7:00 PM. Check-out is 8:00 AM to 11:00 AM.",
        "q": "What time is check-in and check-out?"
      },
      {
        "topic": "Express check-in",
        "answer": "Express and private check-in and check-out are available.",
        "q": "Can we do a quick check-in?"
      },
      {
        "topic": "Early check-in and late check-out",
        "answer": "Both are subject to availability upon request. Contact reception in advance.",
        "q": "Can we arrive early or leave late?"
      },
      {
        "topic": "Reception and contact",
        "answer": "On-site assistance is available. Phone +44 (0) 1830 520803 or email bookings@coachhouseotterburn.co.uk.",
        "q": "How do I contact the hotel?"
      },
      {
        "topic": "Wi-Fi",
        "answer": "Free high-speed Wi-Fi is available throughout all rooms, outdoor seating areas and the guest lounge.",
        "q": "Is the Wi-Fi free?"
      },
      {
        "topic": "Breakfast",
        "answer": "Full English or Irish breakfast is served daily from 8:00 AM to 10:00 AM in the Dining Room, with vegetarian, gluten-free and special diet menus.",
        "q": "What time is breakfast?"
      },
      {
        "topic": "Lounge bar",
        "answer": "The evening lounge bar opens from 6:00 PM daily, serving wines, spirits, local ales, ciders and soft drinks.",
        "q": "Is there a bar?"
      },
      {
        "topic": "Pets",
        "answer": "Pet-friendly rooms are available on request. Guests should confirm with reception before booking.",
        "q": "Can we bring our dog?"
      },
      {
        "topic": "Housekeeping",
        "answer": "Daily housekeeping is provided for all resident guest rooms.",
        "q": "Is the room cleaned daily?"
      },
      {
        "topic": "Smoking and vaping",
        "answer": "Strictly not permitted in indoor rooms. A £100 charge applies for smoking or vaping in a room.",
        "q": "Can I smoke in my room?"
      },
      {
        "topic": "Parking",
        "answer": "Free on-site private parking for resident cars, plus dedicated secure bicycle parking.",
        "q": "Is there parking, and somewhere for bikes?"
      },
      {
        "topic": "Accessibility",
        "answer": "Ground-floor accessible rooms are available on request. Contact reception for arrangements.",
        "q": "Do you have a ground-floor room?"
      },
      {
        "topic": "Fire safety",
        "answer": "Guests should follow the fire-safety instructions and escape route map displayed in the room.",
        "q": "What happens if there's a fire alarm?"
      },
      {
        "topic": "Room types",
        "answer": "Superior Double, Deluxe Double and Large Double rooms each have one double bed; the Large Twin has two twin beds.",
        "q": "What types of room do you have?"
      },
      {
        "topic": "Room features",
        "answer": "Superior Double: en-suite, work area, kettle. Deluxe Double: spacious en-suite, seating area. Large Double: lounge seating, TV, desk. Large Twin: spacious, en-suite.",
        "q": "What's the difference between the rooms?"
      },
      {
        "topic": "Buses",
        "answer": "Otterburn village centre and bus stops are about 1 km away, with regular regional buses to Newcastle-upon-Tyne and Jedburgh.",
        "q": "Is there a bus nearby?"
      },
      {
        "topic": "Railway station",
        "answer": "Hexham Railway Station is about 35 km, a 35-minute drive, on Northern Rail lines between Newcastle and Carlisle.",
        "q": "What's the nearest train station?"
      },
      {
        "topic": "Airport",
        "answer": "Newcastle International Airport is 41 km away, about 35 to 40 minutes via the A696.",
        "q": "How far is the airport?"
      },
      {
        "topic": "Driving",
        "answer": "Road access is straightforward via the A696 and A68.",
        "q": "How do we get there by car?"
      },
      {
        "topic": "Otterburn Mill",
        "answer": "Otterburn Mill, about 1 km away, is a historic textile mill with a café, outdoor shop and trails along the River Rede.",
        "q": "Is there anything within walking distance?"
      },
      {
        "topic": "Wallington Hall",
        "answer": "Wallington Hall & Gardens (21 km) is a National Trust estate with woodland walks, walled gardens, lawns and lakes.",
        "q": "Are there any stately homes nearby?"
      },
      {
        "topic": "Cragside",
        "answer": "Cragside Hall & Gardens (27 km) is a Victorian mansion, the world's first home powered by hydroelectricity, with rock gardens and woodland.",
        "q": "How far is Cragside?"
      },
      {
        "topic": "Kielder Water",
        "answer": "Kielder Water & Forest Park (about 30 km) is Europe's largest man-made lake and a dark sky park: stargazing, mountain biking, watersports and wildlife.",
        "q": "Where's best for stargazing?"
      },
      {
        "topic": "Roman sites",
        "answer": "Brigantium Roman Wall and forts nearby offer Roman heritage, archaeological ruins and frontier fortifications. No distance is given.",
        "q": "Are there Roman sites nearby?"
      },
      {
        "topic": "Places to eat nearby",
        "answer": "Otterburn village pubs and eateries are about 1 km away. Booking in advance is recommended on busy weekends.",
        "q": "Where can we eat in the evening?"
      },
      {
        "topic": "Emergency",
        "answer": "For an immediate life-threatening emergency, call 999.",
        "q": "What do I do in an emergency?"
      },
      {
        "topic": "Non-emergency medical help",
        "answer": "Call NHS 111 for medical advice. The nearest Urgent Treatment Centre is Hexham General Hospital, Corbridge Road, Hexham.",
        "q": "Where's the nearest hospital?"
      }
    ],
    "gaps": [
      {
        "topic": "Dinner",
        "q": "Do you serve dinner at the hotel?"
      },
      {
        "topic": "Breakfast price",
        "q": "Is breakfast included in the price?"
      },
      {
        "topic": "Pet charge",
        "q": "Is there an extra charge for the dog?"
      },
      {
        "topic": "Children and cots",
        "q": "Can you provide a cot for our baby?"
      },
      {
        "topic": "Wi-Fi password",
        "q": "What's the Wi-Fi password?"
      },
      {
        "topic": "Luggage storage",
        "q": "Can we leave our bags after check-out?"
      },
      {
        "topic": "Cancellation policy",
        "q": "What's the cancellation policy?"
      },
      {
        "topic": "EV charging",
        "q": "Can I charge my electric car there?"
      }
    ],
    "cautions": [
      "Do not promise early check-in, late check-out or specific room placements until confirmed with management.",
      "Pet-friendly and ground-floor accessible rooms are on request only; do not guarantee them.",
      "Only breakfast and an evening lounge bar are described; do not promise dinner on site.",
      "The bar closing time is not stated; do not quote one.",
      "The Hexham General Hospital postcode is given as 'NE46 QJ', which looks incomplete; do not read it out as definitive.",
      "Check-in is listed as ending at 7:00 PM; guests arriving later should contact reception, as no late-arrival process is described.",
      "Attraction opening hours and admission can change; check official websites."
    ]
  },
  {
    "id": "woodman-bedale",
    "name": "Woodman Inn",
    "town": "Bedale",
    "contact": "Burneston, Bedale, North Yorkshire, DL8 2HX | +44 (0) 1677 426123 | bookings@woodmaninnpub.com",
    "facts": [
      {
        "topic": "Check-in and check-out",
        "answer": "Check-in is 3:00 PM to 10:00 PM. Check-out is 8:00 AM to 10:30 AM.",
        "q": "What time is check-in and check-out?"
      },
      {
        "topic": "Early check-in and late check-out",
        "answer": "Both are subject to availability upon request. Arrange by phone or at reception.",
        "q": "Can we check in early or check out late?"
      },
      {
        "topic": "Reception and contact",
        "answer": "On-site assistance is available. Phone +44 (0) 1677 426123 or email bookings@woodmaninnpub.com.",
        "q": "How can I contact the inn?"
      },
      {
        "topic": "Wi-Fi",
        "answer": "Free high-speed Wi-Fi throughout all rooms, the garden and pub areas. Network: WoodmanInn_Guest.",
        "q": "Do you have Wi-Fi?"
      },
      {
        "topic": "Breakfast",
        "answer": "Full Yorkshire English breakfast and Continental options are served daily, 7:30 AM to 9:30 AM.",
        "q": "What time is breakfast?"
      },
      {
        "topic": "Lunch",
        "answer": "Lunch is served Wednesday to Sunday, 12:00 PM to 2:30 PM.",
        "q": "Do you serve lunch?"
      },
      {
        "topic": "Dinner",
        "answer": "Dinner is served Monday to Sunday, 6:00 PM to 9:00 PM, featuring traditional British cuisine using fresh local produce.",
        "q": "What time is dinner?"
      },
      {
        "topic": "Bar",
        "answer": "The pub bar is open daily 12:00 PM to 11:00 PM, serving local ales, spirits and soft drinks, with outdoor garden seating.",
        "q": "What are the bar hours?"
      },
      {
        "topic": "Dietary needs",
        "answer": "Vegetarian, vegan and gluten-free choices are available.",
        "q": "Do you have vegan or gluten-free options?"
      },
      {
        "topic": "Dogs",
        "answer": "Well-behaved dogs are welcome in designated rooms, the pub bar area and the garden, at no extra charge.",
        "q": "Can we bring our dog?"
      },
      {
        "topic": "Housekeeping",
        "answer": "Housekeeping is 10:00 AM to 2:00 PM. Multi-night guests should allow daily access for servicing.",
        "q": "When is the room cleaned?"
      },
      {
        "topic": "Smoking and vaping",
        "answer": "Strictly not permitted inside rooms or indoor spaces. A £100 charge applies for smoking or vaping in a room.",
        "q": "Can I smoke in the room?"
      },
      {
        "topic": "Parking",
        "answer": "Free on-site private parking is available for resident guests.",
        "q": "Is there parking?"
      },
      {
        "topic": "Bicycle hire",
        "answer": "Complimentary bicycle hire is provided for guests to explore local country lanes.",
        "q": "Can we borrow bikes?"
      },
      {
        "topic": "Accessibility",
        "answer": "Ground-floor accessible rooms are available on request. Contact reception for assistance.",
        "q": "Do you have a ground-floor room?"
      },
      {
        "topic": "Rooms",
        "answer": "Eight named rooms: Woodland and Forest (Superior King), Copse (Superior Twin), and Oak, Ash, Elm, Cedar and Maple (Standard King).",
        "q": "What rooms do you have?"
      },
      {
        "topic": "Occupancy",
        "answer": "Every room sleeps 2 adults, plus 1 child and 1 infant.",
        "q": "Can we bring our two children?"
      },
      {
        "topic": "Fire safety",
        "answer": "Guests should follow the fire-safety instructions and escape route plan displayed in the room.",
        "q": "What do we do if the fire alarm sounds?"
      },
      {
        "topic": "Buses",
        "answer": "Bedale Market Place and bus stops are about 5 km (5-minute drive), with regular buses to Ripon, Northallerton and Richmond.",
        "q": "Is there a bus nearby?"
      },
      {
        "topic": "Mainline station",
        "answer": "Northallerton is the mainline station, about 10 km (12–15 minute taxi), with direct trains to London King's Cross, Edinburgh, York and Leeds.",
        "q": "What's the nearest mainline train station?"
      },
      {
        "topic": "Bedale station",
        "answer": "Bedale Railway Station, about 5.5 km away, is on the Wensleydale Railway heritage line through the Yorkshire Dales.",
        "q": "Is there a heritage railway nearby?"
      },
      {
        "topic": "Driving",
        "answer": "The inn is 5 minutes from Junction 51 (Leeming Bar) on the A1(M).",
        "q": "How do we get there by car?"
      },
      {
        "topic": "Airports",
        "answer": "Teesside International Airport is 47 km away; Leeds Bradford Airport is 65 km away.",
        "q": "What's the closest airport?"
      },
      {
        "topic": "Thorp Perrow Arboretum",
        "answer": "Thorp Perrow (about 8 km) has 85 acres of woodland gardens, bird of prey displays and a mammal centre. Dog-friendly on leads.",
        "q": "What's there to do nearby?"
      },
      {
        "topic": "Family attractions",
        "answer": "Lightwater Valley Theme Park and the Aerial Extreme high-ropes course are both about 14 km away.",
        "q": "Is there anything for kids nearby?"
      },
      {
        "topic": "Jervaulx Abbey",
        "answer": "Jervaulx Abbey (18 km) is a ruined 12th-century Cistercian abbey in wildflower grounds. Dog-friendly.",
        "q": "Are there any historic sites nearby?"
      },
      {
        "topic": "Bedale Golf Club",
        "answer": "Bedale Golf Club (6 km) is an 18-hole parkland course suitable for all skill levels.",
        "q": "Is there a golf course nearby?"
      },
      {
        "topic": "Bedale Market Place",
        "answer": "Bedale (about 5 km) has independent bakeries, tea rooms, butchers and pubs. Market day is every Tuesday.",
        "q": "When is market day in Bedale?"
      },
      {
        "topic": "Emergency",
        "answer": "For an immediate life-threatening emergency, call 999.",
        "q": "What do I do in an emergency?"
      },
      {
        "topic": "Non-emergency medical help",
        "answer": "Call NHS 111. The nearest Urgent Treatment Centre is Friarage Hospital, Northallerton (DL6 1JG).",
        "q": "Where's the nearest hospital?"
      }
    ],
    "gaps": [
      {
        "topic": "Wi-Fi password",
        "q": "What's the Wi-Fi password?"
      },
      {
        "topic": "Breakfast price",
        "q": "Is breakfast included in our rate?"
      },
      {
        "topic": "Cancellation policy",
        "q": "Can I cancel without being charged?"
      },
      {
        "topic": "EV charging",
        "q": "Do you have an EV charging point?"
      },
      {
        "topic": "Luggage storage",
        "q": "Can we leave our luggage after check-out?"
      },
      {
        "topic": "Room service",
        "q": "Can we have food brought to our room?"
      },
      {
        "topic": "Laundry",
        "q": "Do you have a laundry service?"
      }
    ],
    "cautions": [
      "Do not promise early check-in, late check-out, parking spaces or accessibility arrangements until availability and terms are confirmed.",
      "Rooms are named 'King' but the bed is listed as '1 Double Bed'; do not promise a king-size bed.",
      "Dogs are allowed in designated rooms only; confirm a dog-friendly room is allocated.",
      "Only the Wi-Fi network name is given, not the password.",
      "Continental breakfast appears only in the FAQ, not the main breakfast listing; confirm if a guest specifically asks."
    ]
  },
  {
    "id": "county-selkirk",
    "name": "County Hotel",
    "town": "Selkirk",
    "contact": "3–5 High Street, Selkirk, TD7 4BZ, Scottish Borders | +44 0330 818 8815 | email not listed",
    "facts": [
      {
        "topic": "Check-in and check-out",
        "answer": "Check-in is from 4:00 PM by smart-lock self check-in. Check-out is by 10:00 AM.",
        "q": "What time is check-in and check-out?"
      },
      {
        "topic": "Early check-in",
        "answer": "Check-in at 3:00 PM is free, subject to availability. Check-in between 12:00 PM and 3:00 PM has a £30 surcharge.",
        "q": "Can we check in early?"
      },
      {
        "topic": "Self check-in",
        "answer": "Guests receive a unique smart-lock code by email or text 1 day before arrival, which unlocks the entrance and the room.",
        "q": "How does self check-in work?"
      },
      {
        "topic": "Parking",
        "answer": "Free on-site parking in the private lot for all resident guests, subject to availability.",
        "q": "Is parking free?"
      },
      {
        "topic": "Wi-Fi",
        "answer": "Complimentary high-speed Wi-Fi is provided throughout the hotel.",
        "q": "Do you have Wi-Fi?"
      },
      {
        "topic": "Pets",
        "answer": "Pets are not allowed at the hotel.",
        "q": "Can we bring our dog?"
      },
      {
        "topic": "In-room facilities",
        "answer": "Every room has a private en-suite, flat-screen TV, mini-fridge, microwave, toaster, electric kettle and keyless smart-lock access.",
        "q": "What's in the rooms?"
      },
      {
        "topic": "Rooms and floors",
        "answer": "Room 109 King (1st floor); 107 King and 108 Small King (2nd floor); 201 King, 202 Single, 203 and 204 Double, 205 Twin, 206 Family (top floor).",
        "q": "Which floor is my room on?"
      },
      {
        "topic": "Room 203",
        "answer": "Room 203 is a Double Room with one double bed for 1 adult and 1 child.",
        "q": "Do you have a room for me and my child?"
      },
      {
        "topic": "Family room",
        "answer": "Room 206 on the top floor is the Family Room; exact bed layout is not specified.",
        "q": "Do you have a family room?"
      },
      {
        "topic": "Breakfast",
        "answer": "Breakfast is served daily 7:30 AM to 9:30 AM: full hot breakfast made to order, continental options, filter coffee, tea and herbal teas.",
        "q": "What time is breakfast?"
      },
      {
        "topic": "Bar and restaurant",
        "answer": "The bar and restaurant are open daily 11:00 AM to 10:00 PM, serving home-cooked food and drinks.",
        "q": "What time is the bar and restaurant open?"
      },
      {
        "topic": "Coffee shop",
        "answer": "The coffee shop is open daily for fresh coffee, soft drinks and light snacks.",
        "q": "Is there somewhere to get a coffee?"
      },
      {
        "topic": "Bus stop",
        "answer": "Market Place / High Street stop is right outside (1 minute, 100 m). Borders Buses X95 and 73 go to Galashiels, Hawick and Carlisle.",
        "q": "Where's the nearest bus stop?"
      },
      {
        "topic": "Other bus stops",
        "answer": "Muthag Street and Station Road stops are a 3 to 5 minute walk, providing local town loops across Selkirk.",
        "q": "Are there other bus stops nearby?"
      },
      {
        "topic": "Railway station",
        "answer": "Tweedbank Railway Station (TD6 9BD) is about 7 miles, a 12-minute drive or taxi, with direct hourly trains to Edinburgh Waverley (about 55 minutes).",
        "q": "What's the nearest train station?"
      },
      {
        "topic": "Galashiels Interchange",
        "answer": "Galashiels Interchange, about 6.5 miles (15-minute bus ride), combines Galashiels train station and the bus interchange.",
        "q": "How do we get to Galashiels?"
      },
      {
        "topic": "Getting to Edinburgh",
        "answer": "Take the X95 bus from outside the hotel to Tweedbank or Galashiels station, then the hourly direct train to Edinburgh Waverley (about 55 minutes).",
        "q": "How do I get to Edinburgh by train?"
      },
      {
        "topic": "Halliwell's House Museum",
        "answer": "Halliwell's House Museum, Market Place (TD7 4BL), is one of Selkirk's oldest buildings, with exhibits on town history, trades and Common Riding.",
        "q": "Is there a museum in town?"
      },
      {
        "topic": "Sir Walter Scott's Courtroom",
        "answer": "In Market Place: the historic courtroom where Sir Walter Scott sat as Sheriff of Selkirkshire for 33 years.",
        "q": "What's Sir Walter Scott's Courtroom?"
      },
      {
        "topic": "The Haining",
        "answer": "The Haining is a historic estate close to the town centre with a peaceful loch and woodland walks.",
        "q": "Is there a nice walk nearby?"
      },
      {
        "topic": "Abbotsford House",
        "answer": "Abbotsford House in Melrose (TD6 9BQ) was Sir Walter Scott's home, with library, gardens and visitor centre.",
        "q": "Where's Abbotsford?"
      },
      {
        "topic": "Abbeys",
        "answer": "Melrose Abbey holds Robert the Bruce's heart; Dryburgh Abbey, near St Boswells, is Sir Walter Scott's burial place.",
        "q": "Are there any abbeys we can visit?"
      },
      {
        "topic": "Bowhill and Floors Castle",
        "answer": "Bowhill House near Selkirk is the Duke of Buccleuch's seat with fine art and trails; Floors Castle in Kelso is Scotland's largest inhabited castle.",
        "q": "Any castles or stately homes nearby?"
      },
      {
        "topic": "Common Riding",
        "answer": "Selkirk Common Riding is one of the oldest Borders festivals, commemorating the town's history and boundary checks.",
        "q": "What's the Common Riding?"
      },
      {
        "topic": "Emergency and medical",
        "answer": "For emergencies, call 999. For non-emergency medical advice, call NHS 111. The nearest hospital is Borders General Hospital, Melrose (TD6 9BS).",
        "q": "Where's the nearest hospital?"
      }
    ],
    "gaps": [
      {
        "topic": "Wi-Fi password",
        "q": "What's the Wi-Fi password?"
      },
      {
        "topic": "Lift",
        "q": "Is there a lift to the top floor?"
      },
      {
        "topic": "Smoking",
        "q": "Can I smoke in my room?"
      },
      {
        "topic": "Late check-out",
        "q": "Can we check out late?"
      },
      {
        "topic": "Luggage storage",
        "q": "Can we leave our bags before check-in?"
      },
      {
        "topic": "Cancellation policy",
        "q": "What's your cancellation policy?"
      },
      {
        "topic": "Breakfast price",
        "q": "Is breakfast included in the price?"
      },
      {
        "topic": "Restaurants in town",
        "q": "Can you recommend a restaurant in Selkirk?"
      }
    ],
    "cautions": [
      "Check-in is smart-lock self check-in; no staffed reception hours are given, so do not promise someone will be at a desk.",
      "Early check-in at 3:00 PM is subject to availability; do not guarantee it.",
      "Parking is subject to availability.",
      "Room numbering is unusual (109 on the 1st floor, 107 and 108 on the 2nd floor); double-check before directing a guest.",
      "Most rooms are on upper floors and no lift is mentioned; do not promise step-free access.",
      "No email address is listed; only the phone number +44 0330 818 8815."
    ]
  }
];

export default HOTELS;
