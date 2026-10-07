export const goals = [
  {
    id: "vacation",
    title: "Dream vacation in Barcelona with the kids",
    date: "Spring · 2027",
    image: "/assets/429f6.png",
    count: 3,
    tone: "blue",
  },
  {
    id: "gym",
    title: "Build a home gym in the garage before winter starts",
    date: "Autumn · 2026",
    image: "/assets/61a48.png",
    count: 2,
    private: true,
    tone: "navy",
  },
  {
    id: "bathroom",
    title: "Renovate the family bathroom",
    date: "Winter · 2026",
    image: "/assets/d90ac.png",
    count: 3,
    tone: "blue",
  },
  {
    id: "renovation",
    title: "Finish the downstairs renovation",
    date: "Summer · 2026",
    image: "/assets/2d5b4.png",
    count: 2,
    private: true,
    tone: "navy",
  },
  {
    id: "camper",
    title: "Take the camper along the coast",
    date: "Summer · 2027",
    image: "/assets/7ca0e.png",
    count: 3,
    tone: "blue",
  },
  {
    id: "balloon",
    title: "Take a hot air balloon ride",
    date: "Spring · 2027",
    image: "/assets/26b47.png",
    count: 3,
    tone: "blue",
  },
];

export const timeline = [
  {
    year: "2026",
    seasons: [
      {
        name: "Spring",
        icon: "/assets/8613c.svg",
        goals: [
          { title: "Got married", tone: "neutral", count: 2 },
          {
            title: "Build a home gym in the garage before winter starts",
            tone: "navy",
            image: "/assets/61a48.png",
            private: true,
            count: 2,
          },
        ],
      },
      {
        name: "Summer",
        icon: "/assets/37d90.svg",
        goals: [
          {
            title: "Dream vacation in Barcelona with the kids",
            tone: "blue",
            image: "/assets/429f6.png",
            count: 2,
          },
        ],
      },
      { name: "Autumn", icon: "/assets/14f26.svg", goals: [] },
      {
        name: "Winter",
        icon: "/assets/97e01.svg",
        active: true,
        goals: [
          {
            title: "Dream vacation in Barcelona with the kids",
            tone: "blue",
            image: "/assets/429f6.png",
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
        icon: "/assets/8613c.svg",
        goals: [
          {
            title: "Build a home gym in the garage before winter starts",
            tone: "navy",
            image: "/assets/61a48.png",
            private: true,
            count: 2,
          },
          {
            title: "Build a home gym in the garage before winter starts",
            tone: "navy",
            image: "/assets/61a48.png",
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

export const chatTopics = [
  "Travel dates",
  "Destination",
  "Rough budget",
  "Goal creation",
];
