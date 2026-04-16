export interface Milestone {
  id: string;
  step: number;
  title: string;
  description: string;
  icon: string;
  route: string;
  completed: boolean;
  loading: boolean;
}
