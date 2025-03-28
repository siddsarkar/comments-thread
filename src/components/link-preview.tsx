import defaultPlaceholder from "@/assets/placeholder.webp";
import { cn } from "@/lib/utils";
import { ComponentProps, memo, useEffect, useState } from "react";

const LinkPreviewImage = memo(function LinkPreviewImage({
  className,
  src,
  ...props
}: ComponentProps<"img">) {
  const [preview, setPreview] = useState<string>(defaultPlaceholder);

  useEffect(() => {
    const fetchPreviewImage = async () => {
      fetch(`https://api.microlink.io?url=${src}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.data?.image?.url) {
            setPreview(data.data.image.url);
          }
        });
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
});

export { LinkPreviewImage };
