export interface Category {
  order: number;
  name: string;
  description: string;
}

export const Categories: Category[] = [
  {
    order: 0,
    name: "Life Partners",
    description: "You will spend your life with:",
  },
  { order: 10, name: "Jobs", description: "Your job will be " },
  { order: 20, name: "Cars", description: "You will drive a " },
  { order: 30, name: "Pets", description: "You will have a " },
  { order: 40, name: "Houses", description: "You will live in " },
];
