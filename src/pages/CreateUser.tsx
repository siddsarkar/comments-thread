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
import { useAuth } from "@/context/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { get, getDatabase, ref, set } from "firebase/database";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export function ProfileForm() {
  const { user, setUser } = useAuth();
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    if (!user) {
      toast.error("User not found");
      return;
    }

    const db = getDatabase();

    const userRef = ref(db, "users/" + user.uid);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        set(userRef, {
          ...snapshot.val(),
          username: values.username,
        }).then(() => {
          setUser({
            ...user,
            username: values.username,
          });
          toast.success("Profile updated");
        });
      }
    });
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.username) {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
