import { useAuth } from "@/context/AuthContext";
import { fetchItem, fetchProfile } from "@/services/hackernews-api";
import { UserProfile } from "@/types/hackernews";
import {
  ImmutableArray,
  ImmutableObject,
  suspend,
  useHookstate,
} from "@hookstate/core";
import { getDatabase, ref, runTransaction } from "firebase/database";

const Comments = ({ commentsIds }: { commentsIds: ImmutableArray<number> }) => {
  const fetchResource = () => Promise.all(commentsIds.map(fetchItem));
  const state = useHookstate(fetchResource);

  const handleDeleteComment = (commentId: number) => {
    const db = getDatabase();
    runTransaction(ref(db, `/items/${commentId}`), (comment) => {
      if (comment) {
        comment.deleted = true;
        comment.text = "[deleted]";
      }
      return comment;
    }).then(() => {
      state.set(fetchResource);
    });
  };

  if (state.promised) {
    return <div>Loading...</div>;
  }

  if (state.error) {
    return <div>Error: {state.error.message}</div>;
  }

  return (
    suspend(state) ||
    state.value.map((comment) => (
      <div onClick={() => handleDeleteComment(comment.id)} key={comment.id}>
        {comment.text}
      </div>
    ))
  );
};

const Posts = ({ itemIds }: { itemIds: ImmutableArray<number> }) => {
  const fetchResource = () => Promise.all(itemIds.map(fetchItem));
  const state = useHookstate(fetchResource);

  if (state.promised) {
    return <div>Loading...</div>;
  }

  if (state.error) {
    return <div>Error: {state.error.message}</div>;
  }

  return (
    suspend(state) ||
    state.value.map((item) => <div key={item.id}>{item.title}</div>)
  );
};

const UserInfo = ({ user }: { user: ImmutableObject<UserProfile> }) => {
  return (
    <div>
      <div>Name: {user.username}</div>
      <div>Email: {user.email}</div>
      <textarea name="bio" id="bio" cols={10} rows={3}></textarea>
    </div>
  );
};

export const Profile = () => {
  const { user } = useAuth();
  const fetchResource = () => fetchProfile(user!.uid);

  const state = useHookstate(fetchResource);

  if (state.promised) {
    return <div>Loading...</div>;
  }

  if (state.error) {
    return <div>Error: {state.error.message}</div>;
  }

  return (
    <>
      <UserInfo user={state.value} />

      <br />
      <div>Comments</div>
      <Comments commentsIds={state.value.comments} />
      <br />

      <div>Posts</div>
      <Posts itemIds={state.value.items} />
    </>
  );
};
