import { auth, googleProvider } from "@/firebase";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { get, getDatabase, ref, set } from "firebase/database";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = FirebaseUser & {
  username?: string;
};

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Observe user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const db = getDatabase();

        const userRef = ref(db, "users/" + currentUser.uid);

        get(userRef).then((snapshot) => {
          if (snapshot.exists()) {
            console.log("User exists", snapshot.val());
            setUser({
              ...currentUser,
              username: snapshot.val().username,
            });
            setLoading(false);
          } else {
            set(userRef, {
              id: currentUser.uid,
              email: currentUser.email,
              profile_picture: currentUser.photoURL,
            });
            setUser({
              ...currentUser,
              username: "",
            });
            setLoading(false);
          }
        });
      } else {
        setUser(null);
        setLoading(false);
      }
      // setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const values = useMemo(
    () => ({
      user,
      setUser,
      login,
      logout,
      loading,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

// Custom hook
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { useAuth };
