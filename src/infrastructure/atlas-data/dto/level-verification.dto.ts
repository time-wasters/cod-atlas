type HumanReviewDto = {
  byHuman: boolean;
  user: string | null;
};

export type LevelVerificationDto = {
  locations: HumanReviewDto;
  research: HumanReviewDto;
};
