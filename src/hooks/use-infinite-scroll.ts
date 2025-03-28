import { useEffect, useRef, useState } from "react";

/**
 * Custom hook to implement infinite scrolling.
 * This hook uses the Intersection Observer API to detect when a target element is in view.
 * When the target element is in view, it calls the provided callback function.
 *
 * @param callback - The function to call when the target element is in view.
 * @returns - A ref callback to attach to the target element.
 */
export const useInfiniteScroll = (callback: () => void) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        callback();
      }
    });

    if (element) observer.current.observe(element);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [element, callback]);

  return [setElement];
};
