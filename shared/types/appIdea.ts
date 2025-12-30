export interface AppIdea {
  idea_title: string;
  one_liner: string;
  target_user: string;
  core_user_flow: string[];
  minidev_template_hint: string[];
}

export interface RankedAppIdea extends AppIdea {
  narrative_name: string;
  narrative_confidence: 'strong' | 'emerging' | 'weak';
  narrative_score: number;
  rank_score: number;
}

export interface TemplateSpec {
  template_name: string;
  modules: string[];
  env_vars: string[];
  routes: string[];
  data_models: string[];
}

export interface AppIdeaWithTemplate extends RankedAppIdea {
  template_spec: TemplateSpec;
}