export { MerchantDashboard } from "./components/MerchantDashboard";
export { MerchantSettingsView } from "./components/MerchantSettingsView";
export { MerchantProfileForm } from "./components/MerchantProfileForm";
export { MerchantAvatar } from "./components/MerchantAvatar";
export { OnboardingBanner } from "./components/OnboardingBanner";
export { ProfileCompletionMeter } from "./components/ProfileCompletion";
export {
  useMerchantProfile,
  useUpsertMerchantProfile,
} from "./hooks/useMerchantProfile";
export { useMerchantDashboardStats } from "./hooks/useMerchantStats";
export { computeProfileCompletion } from "./completion";
export type { ProfileCompletion } from "./completion";
export { merchantProfileSchema } from "./schemas";
export type { MerchantProfileValues } from "./schemas";
export type {
  MerchantProfile,
  MerchantStats,
  UpsertMerchantProfileInput,
} from "./types";
