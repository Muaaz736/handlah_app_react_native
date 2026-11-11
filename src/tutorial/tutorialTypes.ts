export type TutorialStep =
  | 'you_are_all_set'
  | 'spotlight_identity_hub'
  | 'spotlight_add_button'
  | 'spotlight_passport_choice'
  | 'passport_form_hint'
  | 'passport_congratulations'
  | 'halo_intro'
  | 'spotlight_halo_fab'
  | 'spotlight_ai_assistant'
  | 'amazing'
  | 'spotlight_account_tab'
  | 'spotlight_user_guide'
  | 'spotlight_guide_module'
  | 'guide_detail'
  | 'complete';

export interface SpotlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpotlightActionBox {
  fn: () => void;
}
