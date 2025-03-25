import { LinkPreviewImage } from "@/components/link-preview";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { formattedDate } from "@/lib/utils";
import { Item } from "@/types/hackernews";
import { ImmutableObject, useHookstate } from "@hookstate/core";
import { getDatabase, increment, ref, runTransaction } from "firebase/database";
import { ExternalLink } from "lucide-react";
import React, { memo } from "react";

type StoryProps = {
  story: ImmutableObject<Item>;
  onCommentClick?: (id: number) => void;
};

export const Story: React.FC<StoryProps> = memo((props) => {
  const { story, onCommentClick } = props;

  const { user } = useAuth();
  const scoreState = useHookstate(story.score);

  const [votes, setVotes] = React.useState(story.votes || {});

  const loadingScoreState = useHookstate(false);

  const handleLikeStory = async (storyId: number) => {
    if (loadingScoreState.get()) return;

    console.log("Like story", storyId);

    if (!user) return;
    loadingScoreState.set(true);

    const db = getDatabase();
    const postRef = ref(db, "/items/" + storyId);

    const uid = user.uid;

    runTransaction(postRef, (post) => {
      if (post) {
        if (post.votes && post.votes[uid]) {
          post.score = increment(-1);
          post.votes[uid] = null;
        } else {
          post.score = increment(1);
          if (!post.votes) {
            post.votes = {};
          }
          post.votes[uid] = true;
        }
      }
      return post;
    })
      .then((result) => {
        console.log(
          "Transaction successfully committed!",
          result.snapshot.val()
        );

        // Update the score in the local state
        scoreState.set(result.snapshot.val().score);
        setVotes(result.snapshot.val().votes);
        // votesState.set(result.snapshot.val().votes);
      })
      .finally(() => {
        loadingScoreState.set(false);
      });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="px-4">
        <LinkPreviewImage src={story.url} />
      </div>
      <div className="space-y-1 px-4">
        <h4 className="text-sm font-medium leading-normal">{story.title}</h4>
        <p className="text-sm text-muted-foreground">
          {story.by} • {formattedDate(story.time)}
        </p>
      </div>

      <div>
        <Separator />
        <div className="flex h-12 items-center justify-around space-x-4 text-sm px-4">
          <button
            disabled={loadingScoreState.get()}
            className="disabled:opacity-50"
            onClick={() => handleLikeStory(story.id)}
            style={{
              color: votes[user!.uid] ? "teal" : "inherit",
            }}
          >
            {scoreState.get() || 0} Points
          </button>
          <Separator orientation="vertical" />
          <div
            onClick={() => onCommentClick?.(story.id)}
            className="cursor-pointer"
          >
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
    </div>
  );
});
