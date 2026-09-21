import type { ImageSourcePropType } from "react-native";

export type DemoProfile = {
  id: string;
  name: string;
  age: number;
  city: string;
  nationality: string;
  bio: string;
  interests: string[];
  instagram: string;
  images: [ImageSourcePropType, ImageSourcePropType, ImageSourcePropType];
  tag: string;
  matchOnLike?: boolean;
};

export const demoProfiles: DemoProfile[] = [
  {
    id: "sherlyn-demo",
    name: "Sherlyn",
    age: 23,
    city: "Mexico City",
    nationality: "Mexican",
    bio: "Always down for one more game and a good sunset run.",
    interests: ["Going Out", "Brunch & Cafés", "Fitness", "Social Activities"],
    instagram: "@sherlyn.hoops",
    images: [
      require("../assets/images/demo-profiles/sherlyn-cafe-01.png"),
      require("../assets/images/demo-profiles/sherlyn-cafe-02.png"),
      require("../assets/images/demo-profiles/sherlyn-cafe-03.png"),
    ],
    tag: "Hoop+",
    matchOnLike: true,
  },
  {
    id: "maya-demo",
    name: "Maya",
    age: 25,
    city: "Guadalajara",
    nationality: "Mexican",
    bio: "Court time, playlists and training sessions before brunch.",
    interests: ["Fitness", "Gym", "Wellness"],
    instagram: "@maya.runsplays",
    images: [
      require("../assets/images/demo-profiles/maya-gym-01.png"),
      require("../assets/images/demo-profiles/maya-gym-02.png"),
      require("../assets/images/demo-profiles/maya-gym-03.png"),
    ],
    tag: "Training",
  },
  {
    id: "jordan-demo",
    name: "Jordan",
    age: 22,
    city: "Monterrey",
    nationality: "Mexican",
    bio: "Looking for new runs, clean passes and competitive energy.",
    interests: ["Events", "Going Out", "College Hoops", "Mixtapes"],
    instagram: "@jordan.oncourt",
    images: [
      require("../assets/images/demo-profiles/jordan-event-01.png"),
      require("../assets/images/demo-profiles/jordan-event-02.png"),
      require("../assets/images/demo-profiles/jordan-event-03.png"),
    ],
    tag: "Streetball",
  },
];
