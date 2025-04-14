import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, NavigateFunction } from 'react-router-dom';
import { auth, googleProvider, db } from '../firebase/config';

// Create a dummy navigate function
const dummyNavigate: NavigateFunction = (to) => {
  console.warn('Navigation attempted outside Router context:', to);
  return;
};

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  isProfileComplete: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: any;
  lastLogin: any;
  investmentExperience: string;
  riskTolerance: string;
  investmentGoals: string[];
  preferredSectors: string[];
  investmentAmount: string;
  investmentTimeframe: string;
  isProfileComplete: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Always call useNavigate (to follow React hooks rules)
  const navigate = useNavigate() || dummyNavigate;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            // Update last login
            await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
            
            // Set user profile
            const profileData = userDoc.data() as UserProfile;
            setUserProfile(profileData);
            
            // If user is on auth page, redirect based on profile status
            if (window.location.pathname === '/auth') {
              if (profileData.isProfileComplete) {
                // If profile is complete, go to home page
                navigate('/');
              } else {
                // Only go to profile page if profile is incomplete
                navigate('/profile');
              }
            }
          } else {
            // Create new user document if it doesn't exist
            const newUserProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || '',
              email: user.email || '',
              photoURL: user.photoURL || '',
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              investmentExperience: '',
              riskTolerance: '',
              investmentGoals: [],
              preferredSectors: [],
              investmentAmount: '',
              investmentTimeframe: '',
              isProfileComplete: false
            };
            
            await setDoc(userDocRef, newUserProfile);
            setUserProfile(newUserProfile);
            
            // Always redirect new users to complete their profile
            navigate('/profile');
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Check if user profile is complete
  const isProfileComplete = userProfile?.isProfileComplete || false;

  // Sign in with Google
  async function signInWithGoogle() {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user already has a profile in the database
      if (result.user) {
        const userDocRef = doc(db, 'users', result.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          // User exists in database
          const profileData = userDoc.data() as UserProfile;
          
          // Update last login
          await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
          setUserProfile(profileData);
          
          // If profile is complete, go to home page directly
          if (profileData.isProfileComplete) {
            navigate('/');
          } else {
            // Profile exists but is incomplete, go to profile page
            navigate('/profile');
          }
        } else {
          // New user - create profile and redirect to profile page
          const newUserProfile: UserProfile = {
            uid: result.user.uid,
            displayName: result.user.displayName || '',
            email: result.user.email || '',
            photoURL: result.user.photoURL || '',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            investmentExperience: '',
            riskTolerance: '',
            investmentGoals: [],
            preferredSectors: [],
            investmentAmount: '',
            investmentTimeframe: '',
            isProfileComplete: false
          };
          
          await setDoc(userDocRef, newUserProfile);
          setUserProfile(newUserProfile);
          navigate('/profile');
        }
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // Sign in with email and password
  async function signInWithEmail(email: string, password: string) {
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation is handled in the auth state change listener
    } catch (error) {
      console.error("Error signing in with email:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // Sign up with email and password
  async function signUpWithEmail(email: string, password: string) {
    try {
      setIsLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      // Navigation is handled in the auth state change listener
    } catch (error) {
      console.error("Error signing up with email:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // Reset password
  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }

  // Logout
  async function logout() {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  }

  // Update user profile
  async function updateUserProfile(profileData: Partial<UserProfile>) {
    if (!currentUser) throw new Error("No authenticated user");
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, { ...profileData, lastUpdated: serverTimestamp() }, { merge: true });
      
      // Update local state
      if (userProfile) {
        const updatedProfile = { ...userProfile, ...profileData };
        setUserProfile(updatedProfile);
        
        // If profile is being marked as complete, redirect to home page
        if (profileData.isProfileComplete && !userProfile.isProfileComplete) {
          navigate('/');
        }
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  const value = {
    currentUser,
    userProfile,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    logout,
    updateUserProfile,
    isProfileComplete
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 