export type ProfileGender =
  | "Man"
  | "Woman"
  | "Non-binary"
  | "Other"
  | "Prefer not to say";

export type ProfileInterest =
  | "Streetball"
  | "Training"
  | "Mixtapes"
  | "WNBA"
  | "College Hoops"
  | "Sneakers";

export type ProfileStat = {
  label: string;
  value: string;
};

export type ProfileDraft = {
  nickname: string;
  birthday: string;
  gender: ProfileGender | null;
  country: string;
  interests: ProfileInterest[];
  profileImageUrl: string | null;
};

export type ProfileRecord = {
  id: string;
  onboarding_completed: boolean;
  full_name: string | null;
  avatar_url: string | null;
  nickname: string | null;
  birth_date: string | null;
  gender: string | null;
  country: string | null;
  interests: ProfileInterest[];
};

export type ProfileUpsertInput = {
  id: string;
  email: string | null;
  fullName: string | null;
  fallbackAvatarUrl: string | null;
  draft: ProfileDraft;
  onboardingCompleted: boolean;
};
