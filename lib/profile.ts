import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "@/lib/supabase";
import type {
  ProfileDraft,
  ProfileGender,
  ProfileInterest,
  ProfileRecord,
  ProfileStat,
  ProfileUpsertInput,
} from "@/types/profile";

const PROFILE_DRAFT_KEY = "hoopig.profile-draft";

type SupabaseProfileGender =
  | "male"
  | "female"
  | "non_binary"
  | "other"
  | "prefer_not_to_say";

const supabaseProfileGenderByLabel: Record<ProfileGender, SupabaseProfileGender> = {
  Man: "male",
  Woman: "female",
  "Non-binary": "non_binary",
  Other: "other",
  "Prefer not to say": "prefer_not_to_say",
};

export const profileGenderOptions: ProfileGender[] = [
  "Man",
  "Woman",
  "Non-binary",
  "Other",
  "Prefer not to say",
];

export const profileInterestOptions: ProfileInterest[] = [
  "Streetball",
  "Training",
  "Mixtapes",
  "WNBA",
  "College Hoops",
  "Sneakers",
];

export const defaultProfileStats: ProfileStat[] = [
  { label: "Posts", value: "24" },
  { label: "Followers", value: "1.8K" },
  { label: "Following", value: "312" },
];

export const emptyProfileDraft: ProfileDraft = {
  nickname: "",
  birthday: "",
  gender: null,
  country: "",
  interests: [],
  profileImageUrl: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeSupabaseError(error: unknown): Error {
  const errorRecord = isRecord(error) ? error : {};
  const code = errorRecord.code;
  const message = errorRecord.message;
  const details = errorRecord.details;
  const hint = errorRecord.hint;
  const fallbackMessage = error instanceof Error ? error.message : String(error);
  const errorMessage = [
    typeof code === "string" ? `code: ${code}` : null,
    typeof message === "string" ? `message: ${message}` : null,
    typeof details === "string" ? `details: ${details}` : null,
    typeof hint === "string" ? `hint: ${hint}` : null,
  ].filter((part): part is string => part !== null);

  return new Error(
    errorMessage.length > 0 ? errorMessage.join("; ") : fallbackMessage
  );
}

function sanitizeInterests(value: unknown) {
  if (!Array.isArray(value)) {
    return emptyProfileDraft.interests;
  }

  return value.filter((interest): interest is ProfileInterest =>
    profileInterestOptions.includes(interest as ProfileInterest)
  );
}

function toSupabaseProfileGender(
  value: ProfileDraft["gender"]
): SupabaseProfileGender {
  if (
    typeof value !== "string" ||
    !Object.prototype.hasOwnProperty.call(supabaseProfileGenderByLabel, value)
  ) {
    throw new Error(
      `Unsupported profile gender "${String(value)}". Choose one of: ${profileGenderOptions.join(", ")}.`
    );
  }

  return supabaseProfileGenderByLabel[value as ProfileGender];
}

export function formatProfileHandle(value: string | null | undefined) {
  const trimmedValue = value?.trim().replace(/^@+/, "");

  if (!trimmedValue) {
    return "hoopigstarter";
  }

  return trimmedValue.toLowerCase().replace(/\s+/g, "");
}

export async function getStoredProfileDraft(): Promise<ProfileDraft> {
  try {
    const rawValue = await AsyncStorage.getItem(PROFILE_DRAFT_KEY);

    if (!rawValue) {
      return emptyProfileDraft;
    }

    const parsedValue = JSON.parse(rawValue);

    if (!isRecord(parsedValue)) {
      return emptyProfileDraft;
    }

    return {
      nickname:
        typeof parsedValue.nickname === "string"
          ? parsedValue.nickname
          : emptyProfileDraft.nickname,
      birthday:
        typeof parsedValue.birthday === "string"
          ? parsedValue.birthday
          : emptyProfileDraft.birthday,
      gender:
        typeof parsedValue.gender === "string" &&
        profileGenderOptions.includes(parsedValue.gender as ProfileGender)
          ? (parsedValue.gender as ProfileGender)
          : emptyProfileDraft.gender,
      country:
        typeof parsedValue.country === "string"
          ? parsedValue.country
          : emptyProfileDraft.country,
      interests: sanitizeInterests(parsedValue.interests),
      profileImageUrl:
        typeof parsedValue.profileImageUrl === "string"
          ? parsedValue.profileImageUrl
          : emptyProfileDraft.profileImageUrl,
    };
  } catch {
    return emptyProfileDraft;
  }
}

export async function saveProfileDraft(
  partialDraft: Partial<ProfileDraft>
): Promise<ProfileDraft> {
  const currentDraft = await getStoredProfileDraft();
  const nextDraft: ProfileDraft = {
    ...currentDraft,
    ...partialDraft,
    interests: Array.isArray(partialDraft.interests)
      ? partialDraft.interests
      : currentDraft.interests,
  };

  await AsyncStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(nextDraft));

  return nextDraft;
}

export async function clearProfileDraft() {
  await AsyncStorage.removeItem(PROFILE_DRAFT_KEY);
}

function toSupabaseDate(birthday: string): string | null {
  const value = birthday.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, month, day, year] = match;
  const parsedDate = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day))
  );

  if (
    parsedDate.getUTCFullYear() !== Number(year) ||
    parsedDate.getUTCMonth() !== Number(month) - 1 ||
    parsedDate.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export async function getProfileByUserId(
  userId: string
): Promise<ProfileRecord | null> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, onboarding_completed, full_name, avatar_url, nickname, birth_date, gender, country, interests"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    onboarding_completed: data.onboarding_completed === true,
    full_name: typeof data.full_name === "string" ? data.full_name : null,
    avatar_url: typeof data.avatar_url === "string" ? data.avatar_url : null,
    nickname: typeof data.nickname === "string" ? data.nickname : null,
    birth_date: typeof data.birth_date === "string" ? data.birth_date : null,
    gender: typeof data.gender === "string" ? data.gender : null,
    country: typeof data.country === "string" ? data.country : null,
    interests: sanitizeInterests(data.interests),
  };
}

export async function upsertProfile({
  id,
  email,
  fullName,
  fallbackAvatarUrl,
  draft,
  onboardingCompleted,
}: ProfileUpsertInput): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const birthDate = toSupabaseDate(draft.birthday);

  if (!birthDate) {
    throw new Error("Enter your birthday as MM/DD/YYYY or YYYY-MM-DD.");
  }

  const supabaseGender = toSupabaseProfileGender(draft.gender);

  const payload = {
    id,
    email,
    full_name: fullName,
    avatar_url: draft.profileImageUrl || fallbackAvatarUrl || null,
    nickname: draft.nickname.trim(),
    birth_date: birthDate,
    gender: supabaseGender,
    country: draft.country.trim(),
    interests: draft.interests,
    onboarding_completed: onboardingCompleted,
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    throw normalizeSupabaseError(error);
  }
}
