import { StudyAchievementId } from './achievement-catalog.js';
export const STUDY_STORAGE_PREFIX: string;
export function readStudyAchievements(): StudyAchievementId[];
export function unlockStudyAchievement(id: StudyAchievementId): void;
export function resetStudyAchievements(): void;
