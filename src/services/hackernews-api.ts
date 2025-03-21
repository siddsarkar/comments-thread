import axios from "axios";
import { HNItem } from "../types/hackernews";

const api = axios.create({
  baseURL: "https://hacker-news.firebaseio.com/v0",
});

export async function fetchItem(id: number): Promise<HNItem> {
  const response = await api.get(`/item/${id}.json`);
  return response.data;
}

export async function fetchTopStories(): Promise<number[]> {
  const response = await api.get(`/topstories.json`);
  return response.data;
}
