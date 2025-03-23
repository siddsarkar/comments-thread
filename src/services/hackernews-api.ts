import { Item } from "@/types/hackernews";
import axios from "axios";

const api = axios.create({
  baseURL:
    "https://comment-thread-ad39f-default-rtdb.asia-southeast1.firebasedatabase.app",
});

export async function fetchItem(id: number): Promise<Item> {
  const response = await api.get(`/items/${id}.json`);
  return response.data;
}

export async function fetchTopStories(): Promise<number[]> {
  const response = await api.get(`/latest.json`);
  return response.data ?? [];
}
