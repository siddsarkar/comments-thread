import { Item, UserProfile } from "@/types/hackernews";
import axios from "axios";
import {
  equalTo,
  get,
  getDatabase,
  orderByChild,
  query,
  ref,
} from "firebase/database";

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

export async function fetchProfile(uid: string): Promise<UserProfile> {
  const response = await api.get(`/users/${uid}.json`);
  return response.data;
}

export async function fetchProfileByUsername(
  username: string
): Promise<UserProfile | null | undefined> {
  return new Promise((resolve) => {
    const db = getDatabase();
    const userQuery = query(
      ref(db, "users"),
      orderByChild("username"),
      equalTo(username)
    );

    get(userQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            console.log("User found", user);
            resolve(user);
          });
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        console.error(error);
        resolve(null);
      });
  });
}
