import { HNItem } from "../types/hackernews";

const BASE_URL = "https://hacker-news.firebaseio.com/v0";

export async function fetchItem(id: number): Promise<HNItem> {
  const response = await fetch(`${BASE_URL}/item/${id}.json`);
  return response.json();
}

export async function fetchTopStories(): Promise<number[]> {
  const response = await fetch(`${BASE_URL}/topstories.json`);
  return response.json();
}
