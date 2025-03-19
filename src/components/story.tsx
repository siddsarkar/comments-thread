import { ExternalLink } from "lucide-react";
import { HNItem } from "../types/hackernews";

interface StoryProps {
  story: HNItem;
  onClick?: () => void;
}

import { Separator } from "@/components/ui/separator";
import { age } from "@/lib/utils";

import React, { useEffect } from "react";

interface ILinkPreviewProps {
  url?: string;
}

const defaultPlaceholder =
  "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";

function LinkPreview(props: ILinkPreviewProps) {
  const { url } = props;

  const [preview, setPreview] = React.useState<string>(defaultPlaceholder);

  const fetchPreviewImage = async (url?: string) => {
    fetch(`https://api.microlink.io?url=${url}`)
      .then((response) => response.json())
      .then((data) => setPreview(data?.data?.image?.url ?? defaultPlaceholder));
  };

  useEffect(() => {
    fetchPreviewImage(url);
  }, [url]);

  return (
    // <div className="w-full">
    <img
      className="h-full w-full object-cover rounded-lg bg-gray-500"
      src={preview}
      alt="preview"
    />
    // </div>
  );

  // return (
  //   <div style={styles.container}>
  //     <iframe
  //       src={url}
  //       style={styles.iframe}
  //       title="Link Preview"
  //       loading="lazy"
  //       sandbox="allow-scripts allow-same-origin"
  //       frameBorder={0}

  //     />
  //     <a
  //       href={url}
  //       target="_blank"
  //       rel="noopener noreferrer"
  //       style={styles.overlay}
  //     >
  //       Visit Link
  //     </a>
  //   </div>
  // );
}

export function Story({ story, onClick }: StoryProps) {
  const formattedDate = age(new Date(story.time * 1000));

  return (
    <div className="space-y-8">
      <LinkPreview url={story.url} />
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-normal">{story.title}</h4>
        <p className="text-sm text-muted-foreground">
          {story.by} • {formattedDate}
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>{story.score} points</div>
        <Separator orientation="vertical" />
        <div onClick={onClick} className="cursor-pointer">
          {story.descendants} Comments
        </div>
        <Separator orientation="vertical" />
        <div>
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            <ExternalLink size={12} /> Source
          </a>
        </div>
      </div>
    </div>
  );
}
