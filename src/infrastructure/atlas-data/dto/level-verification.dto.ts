type HumanReviewDto = {
  byHuman: boolean;
  user: string | null;
  reason?: string;
};

export type LevelVerificationDto = {
  locations: HumanReviewDto;
  research: HumanReviewDto;
};
