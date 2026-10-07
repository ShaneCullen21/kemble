import { asset } from "./asset.js"

export const goals = [
  {
    id: "vacation",
    title: "Dream vacation in Barcelona with the kids",
    date: "Spring · 2027",
    image: asset("assets/429f6.png"),
    count: 3,
    tone: "blue",
    progress: 40,
    funded: 2000,
    target: 5000,
    milestonesDone: 1,
    milestonesTotal: 4,
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
    milestonesDone: 4,
    milestonesTotal: 10,
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
    milestonesDone: 2,
    milestonesTotal: 8,
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
    milestonesDone: 6,
    milestonesTotal: 12,
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
    milestonesDone: 1,
    milestonesTotal: 6,
  },
  {
    id: "balloon",
    title: "Take a hot air balloon ride",
    date: "Spring · 2027",
    image: asset("assets/26b47.png"),
    count: 3,
    tone: "blue",
    progress: 70,
    funded: 180,
    target: 250,
    milestonesDone: 3,
    milestonesTotal: 4,
  },
];

export const timeline = [
  {
    year: "2026",
    seasons: [
      {
        name: "Spring",
        icon: asset("assets/8613c.svg"),
        goals: [
          { title: "Got married", tone: "neutral", count: 2 },
          {
            title: "Build a home gym in the garage before winter starts",
            tone: "navy",
            image: asset("assets/61a48.png"),
            private: true,
            count: 2,
          },
        ],
      },
      {
        name: "Summer",
        icon: asset("assets/37d90.svg"),
        goals: [
          {
            title: "Dream vacation in Barcelona with the kids",
            tone: "blue",
            image: asset("assets/429f6.png"),
            count: 2,
          },
        ],
      },
      { name: "Autumn", icon: asset("assets/14f26.svg"), goals: [] },
      {
        name: "Winter",
        icon: asset("assets/97e01.svg"),
        active: true,
        goals: [
          {
            title: "Dream vacation in Barcelona with the kids",
            tone: "blue",
            image: asset("assets/429f6.png"),
            count: 2,
          },
        ],
      },
    ],
  },
  {
    year: "2027",
    seasons: [
      {
        name: "Spring",
        icon: asset("assets/8613c.svg"),
        goals: [
          {
            title: "Build a home gym in the garage before winter starts",
            tone: "navy",
            image: asset("assets/61a48.png"),
            private: true,
            count: 2,
          },
          {
            title: "Build a home gym in the garage before winter starts",
            tone: "navy",
            image: asset("assets/61a48.png"),
            private: true,
            count: 2,
          },
        ],
      },
    ],
  },
];

export const milestones = [
  { title: "Choose destination — Spain", done: true },
  { title: "Choose dates", done: false },
  { title: "Set the budget", done: true },
  { title: "Book the experience", done: false },
];

export const milestoneGroups = [
  {
    title: "Decide where",
    status: "Done",
    tone: "done",
    items: [
      { title: "Which country should we visit?", detail: "Spain", done: true },
      {
        title: "What cities should we spend time in?",
        detail: "Madrid, Toledo and Barcelona",
        done: true,
        owner: "AB",
      },
    ],
  },
  {
    title: "Decide which 2 weeks to go",
    status: "Tracking",
    tone: "tracking",
    items: [
      { title: "Check work schedule and time off", done: false, owner: "AB" },
      { title: "Check the kids summer camp schedule", done: false, owner: "photo" },
    ],
  },
  {
    title: "Decide what activities to do",
    status: "Yet to come",
    tone: "later",
    items: [{ title: "Brainstorm activities", done: false, owner: "photo" }],
  },
  {
    title: "Agree a budget",
    status: "Yet to come",
    tone: "later",
    items: [
      { title: "Set a spending limit for the trip", done: false, owner: "AB" },
      { title: "Decide what to save each month", done: false, owner: "photo" },
      { title: "Check what is already saved", done: false, owner: "AB" },
    ],
  },
  {
    title: "Book the flights",
    status: "Yet to come",
    tone: "later",
    items: [
      { title: "Compare routes into Spain", done: false, owner: "AB" },
      { title: "Hold seats for the two weeks", done: false, owner: "photo" },
    ],
  },
  {
    title: "Sort the stay",
    status: "Yet to come",
    tone: "later",
    items: [
      { title: "Pick a base in Barcelona", done: false, owner: "AB" },
      { title: "Check it works for the kids", done: false, owner: "photo" },
    ],
  },
  {
    title: "Get ready to go",
    status: "Yet to come",
    tone: "later",
    items: [
      { title: "Make a packing list", done: false, owner: "AB" },
      { title: "Sort passports and insurance", done: false, owner: "photo" },
    ],
  },
];

export const chatTopics = [
  "Travel dates",
  "Destination",
  "Rough budget",
  "Goal creation",
];
