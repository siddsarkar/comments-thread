import { cn } from "@/lib/utils";
import { ComponentProps, useEffect, useState } from "react";

const defaultPlaceholder =
  "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";

function LinkPreviewImage({ className, src, ...props }: ComponentProps<"img">) {
  const [preview, setPreview] = useState<string>(defaultPlaceholder);

  useEffect(() => {
    const fetchPreviewImage = async () => {
      fetch(`https://api.microlink.io?url=${src}`)
        .then((response) => response.json())
        .then((data) =>
          setPreview(data?.data?.image?.url ?? defaultPlaceholder)
        );
    };

    fetchPreviewImage();
  }, [src]);

  return (
    <img
      className={cn(
        "h-full w-full object-cover rounded-lg bg-gray-500 aspect-video",
        className
      )}
      src={preview}
      alt="preview"
      {...props}
    />
  );
}

export { LinkPreviewImage };
