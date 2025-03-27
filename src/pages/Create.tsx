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
import { fetchItem } from "@/services/hackernews-api";
import { Item, ItemType } from "@/types/hackernews";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  child,
  get,
  getDatabase,
  increment,
  ref,
  update,
} from "firebase/database";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const replyFormSchema = z.object({
  text: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

function ReplyForm({ parentId }: { parentId: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Define your form.
  const form = useForm<z.infer<typeof replyFormSchema>>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: {
      text: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof replyFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    if (!user) {
      toast.error("You must be logged in to reply");
      return;
    }

    const db = getDatabase();
    const itemsRef = ref(db, "items");

    const dbRef = ref(db);
    get(child(dbRef, `items/${parentId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          getStoryId(Number(parentId)).then((storyId) => {
            if (storyId) {
              get(itemsRef).then((snapshot) => {
                const itemId = snapshot.size + 1;

                const item: Item = {
                  id: itemId,
                  time: Date.now(),
                  type: ItemType.Comment,
                  by: user.username,
                  parent: Number(parentId),
                  text: values.text,
                };

                const updates = {} as Record<string, unknown>;
                updates["/items/" + itemId] = item;
                // updates["/users/" + user.uid + "/items/" + itemId] = itemId;

                const parentKidsRef = ref(db, "items/" + parentId + "/kids");
                get(parentKidsRef).then((snapshot) => {
                  const kids = snapshot.val() || [];
                  kids.push(itemId);
                  updates["/items/" + parentId + "/kids"] = kids;
                  updates["/items/" + storyId + "/descendants"] = increment(1);

                  const userCommentsRef = ref(
                    db,
                    "users/" + user.uid + "/comments"
                  );
                  get(userCommentsRef).then((snapshot) => {
                    const userItems = snapshot.val() || [];
                    userItems.push(itemId);
                    updates["/users/" + user.uid + "/comments"] = userItems;

                    update(ref(db), updates)
                      .then(() => {
                        navigate(-1);
                      })
                      .catch((error) => {
                        console.error(error);
                        toast.error("Failed to create comment");
                      });
                  });
                });
              });
            }
          });
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Textarea placeholder="write your reply" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={form.formState.isSubmitting} type="submit">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}

const storyFormSchema = z.object({
  url: z.string().url().nonempty(),
  title: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

function StoryForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Define your form.
  const form = useForm<z.infer<typeof storyFormSchema>>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      url: "",
      title: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof storyFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    if (!user) {
      toast.error("You must be logged in to reply");
      return;
    }

    const db = getDatabase();
    const itemsRef = ref(db, "items");

    get(itemsRef).then((snapshot) => {
      const itemId = snapshot.size + 1;

      const item: Item = {
        id: itemId,
        time: Date.now(),
        type: ItemType.Story,
        by: user.username,
        title: values.title,
        url: values.url,
      };

      const updates = {} as Record<string, unknown>;
      updates["/items/" + itemId] = item;
      // updates["/users/" + user.uid + "/items/" + itemId] = itemId;

      const userItemsRef = ref(db, "users/" + user.uid + "/items");
      get(userItemsRef).then((snapshot) => {
        const userItems = snapshot.val() || [];
        userItems.push(itemId);
        updates["/users/" + user.uid + "/items"] = userItems;

        const latest100StoriesRef = ref(db, "latest");
        get(latest100StoriesRef).then((snapshot) => {
          const latest = snapshot.val() || [];
          if (latest.length >= 100) {
            latest.pop();
          }
          latest.unshift(itemId);
          updates["/latest"] = latest;

          update(ref(db), updates)
            .then(() => {
              navigate("/");
            })
            .catch((error) => {
              console.error(error);
              toast.error("Failed to create comment");
            });
        });
      });
    });
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input placeholder="write your reply" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text</FormLabel>
                <FormControl>
                  <Textarea placeholder="write your title" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={form.formState.isSubmitting} type="submit">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}

async function getStoryId(itemId: number) {
  let item = await fetchItem(itemId);
  while (item.type !== ItemType.Story) {
    try {
      if (!item.parent) return null;

      item = await fetchItem(item.parent);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  return item.id;
}

export default function Create() {
  const { user } = useAuth();
  const { storyId: parentId } = useParams();
  // const navigate = useNavigate();

  // const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   const form = event.currentTarget;
  //   const formData = new FormData(form);
  //   const text = formData.get("text") as string;
  //   const url = formData.get("url") as string;
  //   console.log({ text, url });

  //   if (user) {
  //     const db = getDatabase();
  //     const itemsRef = ref(db, "items");

  //     if (parentId) {
  //     } else {
  //       get(itemsRef).then((snapshot) => {
  //         const itemId = snapshot.size + 1;

  //         const item: Item = {
  //           id: itemId,
  //           time: Date.now(),
  //           type: ItemType.Story,
  //           by: user.username,
  //           text,
  //           url,
  //         };

  //         const updates = {} as Record<string, unknown>;
  //         updates["/items/" + itemId] = item;
  //         // updates["/users/" + user.uid + "/items/" + itemId] = item;
  //         const userItemsRef = ref(db, "users/" + user.uid + "/items");
  //         get(userItemsRef).then((snapshot) => {
  //           const userItems = snapshot.val() || [];
  //           userItems.push(itemId);
  //           updates["/users/" + user.uid + "/items"] = userItems;

  //           const latest100StoriesRef = ref(db, "latest");
  //           get(latest100StoriesRef).then((snapshot) => {
  //             const latest = snapshot.val() || [];
  //             if (latest.length >= 100) {
  //               latest.pop();
  //             }
  //             latest.unshift(itemId);
  //             updates["/latest"] = latest;

  //             update(ref(db), updates)
  //               .then(() => {
  //                 navigate("/");
  //               })
  //               .catch((error) => {
  //                 console.error(error);
  //                 toast.error("Failed to create comment");
  //               });
  //           });
  //         });
  //       });
  //     }
  //   }
  // };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div>{parentId ? <ReplyForm parentId={parentId} /> : <StoryForm />}</div>
  );
}
