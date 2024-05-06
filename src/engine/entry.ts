import { Category } from "./category";

// Being very explicit about the definition of the Entry object.
// I don't need this to be particularly flexible, but because the UI bells and whistles are very tightly coupled to it, I want specific control over marking an item per game rules.

export class Entry {
  constructor(
    public category: Category,
    public order: number,
    public title: string,
    public enabled: boolean = true,
  ) {
    this.category = category;
    this.order = order;
    this.title = title;
    this.enabled = enabled;
  }
}
