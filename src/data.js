import { asset } from "./asset.js";

const history = (request, reply, decision, confirmation) => [
  { from: "user", text: request },
  { from: "kemble", text: reply },
  { from: "user", text: decision },
  { from: "kemble", text: confirmation },
];

const done = (title, items) => ({ title, tone: "done", items });
const tracking = (title, items) => ({ title, tone: "tracking", items });
const later = (title, items) => ({ title, tone: "later", items });
const item = (title, options = {}) => {
  const action = { title, done: false, ...options };
  if (action.done && !action.history) {
    const result = action.detail ? ` The result is ${action.detail}.` : "";
    action.history = [
      { from: "user", text: `Can we settle “${title}” now?` },
      { from: "kemble", text: `Yes. I’ll record the decision and keep it with this goal.${result}` },
      { from: "user", text: "That works for me." },
      { from: "kemble", text: "Done. I’ve marked this action as complete." },
    ];
  }
  return action;
};

export const goals = [
  {
    id: "vacation",
    title: "Dream vacation in Barcelona with the kids",
    pageTitle: "Dream vacation in Spain with the kids",
    date: "Spring · 2027",
    image: asset("assets/429f6.png"),
    count: 3,
    tone: "blue",
    progress: 40,
    funded: 2000,
    target: 5000,
    monthly: 100,
    description: "Vacation trip to Spain next summer. Exact dates are still open, and that’s the next call. Alex is keen for the beach and you want time to actually relax. Together you decided on Madrid, Toledo and Barcelona; next you’ll settle the timing and activities.",
    suggestion: "Choose the two travel weeks next. It will make flight and accommodation prices much easier to compare.",
    chatTopics: ["Travel dates", "Destination", "Rough budget", "Goal creation"],
    milestoneGroups: [
      done("Decide where", [
        item("Which country should we visit?", {
          detail: "Spain",
          done: true,
          history: history(
            "We want somewhere warm next summer. Alex is keen for the beach, and I want time to relax.",
            "Spain fits both. It gives Alex the beach and you plenty of slower days.",
            "Spain it is.",
            "Done. The destination is Spain.",
          ),
        }),
        item("What cities should we spend time in?", {
          detail: "Madrid, Toledo and Barcelona",
          done: true,
          owner: "AB",
          history: history(
            "If we’re in Spain, where should we actually spend the days?",
            "Madrid for the city, Toledo as an easy trip, and Barcelona for the beach Alex wants.",
            "Yes, those three.",
            "Saved. You’ll plan Madrid, Toledo and Barcelona.",
          ),
        }),
      ]),
      tracking("Decide which 2 weeks to go", [
        item("Check work schedule and time off", { owner: "AB" }),
        item("Check the kids’ summer camp schedule", { owner: "photo" }),
      ]),
      later("Decide what activities to do", [
        item("Shortlist one activity in each city", { owner: "photo" }),
        item("Leave two unplanned beach days", { owner: "AB" }),
      ]),
      later("Agree a budget", [
        item("Set a spending limit for the trip", { owner: "AB" }),
        item("Decide what to save each month", { owner: "photo" }),
      ]),
      later("Book the flights", [
        item("Compare routes into Spain", { owner: "AB" }),
        item("Hold seats for the two weeks", { owner: "photo" }),
      ]),
      later("Sort the stay", [
        item("Pick a base in Barcelona", { owner: "AB" }),
        item("Check it works for the kids", { owner: "photo" }),
      ]),
      later("Get ready to go", [
        item("Make a packing list", { owner: "AB" }),
        item("Sort passports and insurance", { owner: "photo" }),
      ]),
    ],
  },
  {
    id: "gym",
    title: "Build a home gym in the garage before winter starts",
    date: "Autumn · 2026",
    image: asset("assets/61a48.png"),
    count: 2,
    private: true,
    tone: "navy",
    progress: 40,
    funded: 600,
    target: 1200,
    monthly: 150,
    description: "Turn the back half of the garage into a simple, warm training space before the cold weather arrives. The room is cleared and measured. Next you’re choosing the equipment that earns its place without making the garage feel cramped.",
    suggestion: "Tape the footprint of the rack and bench onto the floor before ordering. It’s the quickest way to test the layout.",
    chatTopics: ["Equipment shortlist", "Garage measurements", "Flooring options", "Gym budget"],
    milestoneGroups: [
      done("Clear and measure the space", [
        item("Clear the back half of the garage", { detail: "Complete", done: true, owner: "AB" }),
        item("Measure the usable floor area", { detail: "3.4m × 2.8m", done: true, owner: "photo" }),
      ]),
      tracking("Choose the core equipment", [
        item("Compare compact power racks", { owner: "AB" }),
        item("Choose an adjustable bench", { owner: "photo" }),
      ]),
      later("Prepare the floor", [
        item("Price rubber floor tiles", { owner: "AB" }),
        item("Check the garage floor is level", { owner: "photo" }),
      ]),
      later("Plan power and lighting", [
        item("Add a brighter ceiling light", { owner: "AB" }),
        item("Check the spare socket load", { owner: "photo" }),
      ]),
      later("Add storage", [
        item("Choose wall storage for weights", { owner: "AB" }),
        item("Make space for mats and bands", { owner: "photo" }),
      ]),
      later("Order and assemble", [
        item("Order the equipment together", { owner: "AB" }),
        item("Set aside an assembly weekend", { owner: "photo" }),
      ]),
    ],
  },
  {
    id: "bathroom",
    title: "Renovate the family bathroom",
    date: "Winter · 2026",
    image: asset("assets/d90ac.png"),
    count: 3,
    tone: "blue",
    progress: 25,
    funded: 800,
    target: 4000,
    monthly: 300,
    description: "Refresh the family bathroom with better storage, a calmer finish and fittings that can handle busy mornings. The layout will stay where it is to protect the budget. You’re now narrowing down the fixtures and finishes.",
    suggestion: "Choose the vanity before the tiles. Its width and finish will make the remaining decisions much simpler.",
    chatTopics: ["Bathroom layout", "Fixture shortlist", "Builder quotes", "Renovation budget"],
    milestoneGroups: [
      done("Keep the existing layout", [
        item("Confirm plumbing stays in place", { detail: "No layout changes", done: true, owner: "AB" }),
        item("Measure the vanity opening", { detail: "900mm", done: true, owner: "photo" }),
      ]),
      tracking("Choose fixtures and finishes", [
        item("Shortlist vanity and basin", { owner: "AB" }),
        item("Pick tile and grout colours", { owner: "photo" }),
      ]),
      later("Get builder quotes", [
        item("Send the same brief to three builders", { owner: "AB" }),
        item("Compare inclusions and timing", { owner: "photo" }),
      ]),
      later("Order long-lead items", [
        item("Order the vanity and tapware", { owner: "AB" }),
        item("Confirm tile stock", { owner: "photo" }),
      ]),
      later("Complete the renovation", [
        item("Protect the hallway and bedrooms", { owner: "AB" }),
        item("Track the two-week build", { owner: "photo" }),
      ]),
      later("Finish the room", [
        item("Install mirrors and hooks", { owner: "AB" }),
        item("Add baskets for family storage", { owner: "photo" }),
      ]),
    ],
  },
  {
    id: "renovation",
    title: "Finish the downstairs renovation",
    date: "Summer · 2026",
    image: asset("assets/2d5b4.png"),
    count: 2,
    private: true,
    tone: "navy",
    progress: 60,
    funded: 3500,
    target: 8000,
    monthly: 450,
    description: "Finish the downstairs rooms so the family can properly use the whole floor again. The structural work and plastering are complete. Carpentry is the next dependency, followed by flooring, paint and the final furniture.",
    suggestion: "Book the carpenter now. The flooring and painting dates can both be planned around that confirmed week.",
    chatTopics: ["Carpentry schedule", "Flooring choices", "Remaining budget", "Room-by-room plan"],
    milestoneGroups: [
      done("Complete the building work", [
        item("Finish plastering downstairs", { detail: "Complete", done: true, owner: "AB" }),
        item("Sign off structural work", { detail: "Complete", done: true, owner: "photo" }),
      ]),
      tracking("Finish the carpentry", [
        item("Fit skirting and door frames", { owner: "AB" }),
        item("Build storage under the stairs", { owner: "photo" }),
      ]),
      later("Lay the flooring", [
        item("Confirm final floor quantity", { owner: "AB" }),
        item("Book the installer", { owner: "photo" }),
      ]),
      later("Paint the rooms", [
        item("Choose the downstairs palette", { owner: "AB" }),
        item("Paint walls and woodwork", { owner: "photo" }),
      ]),
      later("Install lighting", [
        item("Choose dining pendants", { owner: "AB" }),
        item("Fit dimmers in the living room", { owner: "photo" }),
      ]),
      later("Move back in", [
        item("Arrange furniture delivery", { owner: "AB" }),
        item("Set up the family room", { owner: "photo" }),
      ]),
    ],
  },
  {
    id: "camper",
    title: "Take the camper along the coast",
    date: "Summer · 2027",
    image: asset("assets/7ca0e.png"),
    count: 3,
    tone: "blue",
    progress: 15,
    funded: 400,
    target: 3000,
    monthly: 180,
    description: "Take the camper on a slow coastal trip with short driving days, simple campsites and plenty of time near the water. The broad route is agreed. Next you need dates that work for everyone before popular stops fill up.",
    suggestion: "Choose three anchor stops first, then leave the shorter overnight stops flexible around the weather.",
    chatTopics: ["Coastal route", "Travel dates", "Camper checklist", "Trip budget"],
    milestoneGroups: [
      done("Choose the broad route", [
        item("Start on the north coast", { detail: "Confirmed", done: true, owner: "AB" }),
        item("Finish with three beach nights", { detail: "Confirmed", done: true, owner: "photo" }),
      ]),
      tracking("Set the travel dates", [
        item("Check school and work calendars", { owner: "AB" }),
        item("Choose a 12-day window", { owner: "photo" }),
      ]),
      later("Prepare the camper", [
        item("Book a service and tyre check", { owner: "AB" }),
        item("Test the leisure battery", { owner: "photo" }),
      ]),
      later("Reserve anchor stops", [
        item("Shortlist three campsites", { owner: "AB" }),
        item("Book the busiest beach stop", { owner: "photo" }),
      ]),
      later("Plan food and packing", [
        item("Make the camper packing list", { owner: "AB" }),
        item("Plan five easy dinners", { owner: "photo" }),
      ]),
      later("Get road-ready", [
        item("Download offline maps", { owner: "AB" }),
        item("Check breakdown cover", { owner: "photo" }),
      ]),
    ],
  },
  {
    id: "balloon",
    title: "Take a hot air balloon ride",
    date: "Spring · 2027",
    image: asset("assets/26b47.png"),
    count: 3,
    tone: "blue",
    progress: 90,
    funded: 225,
    target: 250,
    monthly: 35,
    description: "An early-morning balloon flight over the Cotswolds as a memorable spring day out. The flight is booked for a May weekend with a flexible weather backup, and the budget is almost there. All that’s left is planning breakfast nearby.",
    suggestion: "Pick a breakfast spot that opens early and can take a later booking if the weather pushes the flight back.",
    chatTopics: ["Flight dates", "Operator reviews", "Weather backup", "Gift voucher"],
    milestoneGroups: [
      done("Choose the location", [
        item("Pick the Cotswolds launch area", { detail: "Confirmed", done: true, owner: "AB" }),
        item("Check the drive time", { detail: "1 hr 20 min", done: true, owner: "photo" }),
      ]),
      done("Find a suitable weekend", [
        item("Check three spring weekends", { detail: "17–18 May", done: true, owner: "AB" }),
        item("Keep a backup weekend free", { detail: "31 May", done: true, owner: "photo" }),
      ]),
      done("Choose an operator", [
        item("Compare safety records and reviews", { detail: "Skyward Balloons", done: true, owner: "AB" }),
        item("Check cancellation terms", { detail: "Free to rebook", done: true, owner: "photo" }),
      ]),
      done("Book the flight", [
        item("Buy a flexible flight voucher", { detail: "Booked", done: true, owner: "AB" }),
        item("Add the booking to the calendar", { detail: "Added", done: true, owner: "photo" }),
      ]),
      tracking("Prepare for the day", [
        item("Check clothing guidance", { detail: "Warm layers", done: true, owner: "AB" }),
        item("Plan breakfast nearby", { owner: "photo" }),
      ]),
    ],
  },
  {
    id: "retirement",
    title: "Retire in Costa Rica",
    date: "Spring · 2055",
    image: asset("assets/429f6.png"),
    count: 1,
    private: true,
    tone: "navy",
    progress: 15,
    funded: 18000,
    target: 120000,
    monthly: 500,
    description: "Build a long-term path towards retiring somewhere warm, green and close to the ocean. Costa Rica is the shared direction, not yet a fixed town. The immediate work is turning that dream into a savings target that can be reviewed each year.",
    suggestion: "Create a separate retirement contribution now and schedule an annual check-in for savings, residency rules and location research.",
    chatTopics: ["Retirement target", "Costa Rica regions", "Residency research", "Long-term savings"],
    milestoneGroups: [
      done("Choose the shared direction", [
        item("Agree on Costa Rica", { detail: "Confirmed", done: true, owner: "AB" }),
        item("Prioritise coast, nature and healthcare", { detail: "Confirmed", done: true, owner: "photo" }),
      ]),
      tracking("Set the savings target", [
        item("Estimate the future monthly budget", { owner: "AB" }),
        item("Review the current contribution", { owner: "photo" }),
      ]),
      later("Explore possible regions", [
        item("Compare Pacific coast towns", { owner: "AB" }),
        item("Research access to hospitals", { owner: "photo" }),
      ]),
      later("Understand residency", [
        item("Review current residency routes", { owner: "AB" }),
        item("Note income requirements", { owner: "photo" }),
      ]),
      later("Plan a research trip", [
        item("Choose two regions to visit", { owner: "AB" }),
        item("Budget for a four-week stay", { owner: "photo" }),
      ]),
      later("Review the plan annually", [
        item("Schedule the yearly money review", { owner: "AB" }),
        item("Refresh the Costa Rica research", { owner: "photo" }),
      ]),
    ],
  },
];

const goalById = Object.fromEntries(goals.map((goal) => [goal.id, goal]));
const seasonIcon = {
  Spring: asset("assets/8613c.svg"),
  Summer: asset("assets/37d90.svg"),
  Autumn: asset("assets/14f26.svg"),
  Winter: asset("assets/97e01.svg"),
};

export const timeline = [
  {
    year: "2025",
    seasons: [
      {
        name: "Winter",
        icon: asset("assets/snowflake-outline.svg"),
        goals: [{ title: "Joined Kemble", tone: "neutral", marker: true }],
      },
    ],
  },
  {
    year: "2026",
    seasons: [
      {
        name: "Spring",
        icon: seasonIcon.Spring,
        goals: [{ title: "Got married", tone: "neutral", marker: true }],
      },
      { name: "Summer", icon: seasonIcon.Summer, goals: [goalById.renovation] },
      { name: "Autumn", icon: seasonIcon.Autumn, goals: [goalById.gym] },
      { name: "Winter", icon: seasonIcon.Winter, active: true, goals: [goalById.bathroom] },
    ],
  },
  {
    year: "2027",
    seasons: [
      { name: "Spring", icon: seasonIcon.Spring, goals: [goalById.vacation, goalById.balloon] },
      { name: "Summer", icon: seasonIcon.Summer, goals: [goalById.camper] },
    ],
  },
  {
    year: "2055",
    seasons: [
      { name: "Spring", icon: seasonIcon.Spring, goals: [goalById.retirement] },
    ],
  },
];
