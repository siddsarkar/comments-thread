import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function age(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = diff / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  const weeks = days / 7;
  const months = days / 30;
  const years = days / 365;

  if (seconds < 60) {
    return "<1m";
  } else if (minutes < 2) {
    return "1m";
  } else if (minutes < 60) {
    return Math.floor(minutes) + "m";
  } else if (hours < 2) {
    return "1h";
  } else if (hours < 24) {
    return Math.floor(hours) + "h";
  } else if (days < 2) {
    return "1d";
  } else if (days < 7) {
    return Math.floor(days) + "d";
  } else if (weeks < 2) {
    return "1w";
  } else if (weeks < 4) {
    return Math.floor(weeks) + "w";
  } else if (months < 2) {
    return "1mo";
  } else if (months < 12) {
    return Math.floor(months) + "mo";
  } else if (years < 2) {
    return "1y";
  } else {
    return Math.floor(years) + "y";
  }
}

const urlRegex = /(https?:\/\/[^\s]+)/g;
export function parseLinks(text: string) {
  return text.replace(
    urlRegex,
    (url) => `<a href="${url}" className="link" target="_blank">${url}</a>`
  );
}

export const formattedDate = (time: number) => age(new Date(time));
