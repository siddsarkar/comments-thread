import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { fetchItem, fetchProfile } from "@/services/hackernews-api";
import { UserProfile } from "@/types/hackernews";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ImmutableArray,
  ImmutableObject,
  suspend,
  useHookstate,
} from "@hookstate/core";
import {
  equalTo,
  get,
  getDatabase,
  orderByChild,
  query,
  ref,
  runTransaction,
  update,
} from "firebase/database";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const Comments = ({
  commentsIds = [],
}: {
  commentsIds: ImmutableArray<number>;
}) => {
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

const Posts = ({ itemIds = [] }: { itemIds: ImmutableArray<number> }) => {
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

const profileFormSchema = z.object({
  email: z.string().readonly().optional(),
  username: z.string().readonly().optional(),
  bio: z.string().optional(),
});

function ProileForm({
  profile,
  isPublic,
}: {
  profile: ImmutableObject<UserProfile>;
  isPublic: boolean;
}) {
  const { user } = useAuth();
  const isUpdatingProfileState = useHookstate(false);

  // 1. Define your form.
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      bio: profile.bio,
      username: profile.username,
      email: profile.email,
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof profileFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    if (!user) {
      toast.error("You must be logged in to reply");
      return;
    }

    const db = getDatabase();
    const updates = {} as Record<string, unknown>;

    if (user) {
      updates["/users/" + user.uid + "/bio"] = values.bio;

      isUpdatingProfileState.set(true);
      update(ref(db), updates)
        .then(() => {
          form.reset();
          toast.success("Profile updated successfully!");
        })
        .catch((err) => {
          toast.error("Failed to update profile:", err);
        })
        .finally(() => {
          isUpdatingProfileState.set(false);
        });
    }
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>username</FormLabel>
                <FormControl>
                  <Input placeholder="write your reply" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>email</FormLabel>
                <FormControl>
                  <Input placeholder="write your reply" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="write your bio"
                    {...field}
                    disabled={isPublic}
                  />
                </FormControl>
                {!isPublic && (
                  <FormDescription>This is your public bio.</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          {!isPublic && (
            <Button
              disabled={isUpdatingProfileState.get() || !form.formState.isDirty}
              type="submit"
            >
              Submit
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}

const fetchProfileByUsername = (
  username: string
): Promise<UserProfile | null | undefined> => {
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
};

fetchProfileByUsername("admin");

const Profile = () => {
  const { user } = useAuth();
  const { uid } = useParams();

  const isOtherUser = uid ? uid !== user?.username : false;

  const fetchResource = () =>
    uid ? fetchProfileByUsername(uid) : fetchProfile(user!.uid!);

  const state = useHookstate(fetchResource);

  if (state.promised) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (state.error) {
    return <div>Error: {state.error.message}</div>;
  }

  if (!state.value) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Not Found</div>
      </div>
    );
  }

  return (
    <>
      <ProileForm isPublic={isOtherUser} profile={state.value} />

      {!isOtherUser && (
        <div className="max-w-lg mx-auto px-4">
          <br />
          <div>Comments</div>
          <Comments commentsIds={state.value.comments} />
          <br />

          <div>Posts</div>
          <Posts itemIds={state.value.items} />
        </div>
      )}
    </>
  );
};

export default Profile;
