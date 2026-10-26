export type StudyAchievementId = 'study-growth-ascent' | 'study-growth-discovery' | 'study-fold-perspectives' | 'study-type-reform' | 'study-type-poster' | 'study-scoop-mix' | 'study-ctrl-reception' | 'study-bentendo-turn' | 'study-field-research';
export interface StudyAchievementText { readonly title: string; readonly description: string; readonly hint: string; }
export interface StudyAchievement { readonly id: StudyAchievementId; readonly study: string | null; readonly category: string; readonly icon: string; readonly de: StudyAchievementText; readonly en: StudyAchievementText; }
export const STUDY_ACHIEVEMENTS: readonly StudyAchievement[];
