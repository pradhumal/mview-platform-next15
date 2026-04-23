-- ============================================================
-- MView Platform — Prompt Starter Schema
-- Supabase / PostgreSQL
--
-- Source of truth: prompt_starters_canonical_v1.json (70 prompts)
-- Aligns with: personaConfigs.ts · usePersona() hook
-- Author: Aboli (2026-04-23)
-- ============================================================

-- ── 0. ENUM TYPES ────────────────────────────────────────────────────────────
-- Narrow literals matching the TypeScript canonical types in
-- personaConfigs.ts exactly. The compiler + DB both reject drift.
-- Adding a new value requires a migration AND a registry proposal.

CREATE TYPE persona_id AS ENUM (
  'legacy_inherited_owner',
  'passive_income_owner',
  'active_deal_seeking_owner',
  'sophisticated_portfolio_owner',
  'distrustful_burned_owner',
  'landman_acquisition_analyst',
  'estate_mineral_manager'
);

-- Nine registered intents + educational_content_lookup (public surface, no user data).
-- New intents require Founder approval before adding here.
CREATE TYPE registered_intent AS ENUM (
  'production_change_analysis',
  'operator_activity_analysis',
  'nearby_drilling_activity',
  'well_performance_analysis',
  'portfolio_overview',
  'mineral_valuation_estimate',
  'explain_change',
  'explain_ownership',
  'evaluate_lease_offer',
  'educational_content_lookup'
);

CREATE TYPE content_surface AS ENUM (
  'prompt_starters_inside_product',
  'direct_intelligence_questions',
  'faq_help_center_questions',
  'trust_building_before_product_action',
  'public_educational_content'
);

CREATE TYPE campaign_type AS ENUM (
  'inheritance_moment',
  'check_change_moment',
  'offer_evaluation',
  'intelligence_layer',
  'trust_verification',
  'acquisition_analysis',
  'portfolio_management'
);

-- ── 1. MAIN TABLE: prompt_starters ──────────────────────────────────────────
-- Single table. All 70 canonical prompts live here.
-- Runtime: Admin edits via MView-Admin → Supabase.
-- Frontend: usePersona() queries by persona_type WHERE is_active = true.
-- Fallback: personaConfigs.ts STATIC_PERSONA_CONFIG used when unreachable.

CREATE TABLE prompt_starters (
  -- Identity
  id              text        PRIMARY KEY,

  -- Persona routing
  persona_type    persona_id  NOT NULL,

  -- Content
  prompt_text     text        NOT NULL CHECK (char_length(prompt_text) BETWEEN 10 AND 300),
  follow_ups      text[]      NOT NULL DEFAULT '{}',

  -- Intent routing
  workflow        registered_intent NOT NULL,

  -- Placement / campaign
  surface         content_surface NOT NULL,
  campaign        campaign_type NOT NULL,

  -- Display ordering
  display_order   smallint    NOT NULL DEFAULT 0,

  -- Access control
  requires_professional_gate  boolean NOT NULL DEFAULT false,

  -- Runtime control
  is_active       boolean     NOT NULL DEFAULT true,
  ab_test_group   text        DEFAULT NULL,

  -- Provenance
  source_version  text        NOT NULL DEFAULT 'v1',
  notes           text        DEFAULT NULL,

  -- Timestamps
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prompt_starters_updated_at
  BEFORE UPDATE ON prompt_starters
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 2. INDEXES ────────────────────────────────────────────────────────────────

-- Primary query pattern: fetch all active starters for a persona, ordered for display.
-- This is the usePersona() hot path.
CREATE INDEX idx_ps_persona_active_order
  ON prompt_starters (persona_type, is_active, display_order ASC);

-- Secondary filter: gate check for professional personas.
CREATE INDEX idx_ps_professional_gate
  ON prompt_starters (requires_professional_gate)
  WHERE requires_professional_gate = true;

-- Campaign analytics queries.
CREATE INDEX idx_ps_campaign
  ON prompt_starters (campaign, is_active);

-- Surface-based queries.
CREATE INDEX idx_ps_surface
  ON prompt_starters (surface, is_active);

-- A/B test cohort queries.
CREATE INDEX idx_ps_ab_test
  ON prompt_starters (ab_test_group)
  WHERE ab_test_group IS NOT NULL;

-- ── 3. ROW LEVEL SECURITY ────────────────────────────────────────────────────

ALTER TABLE prompt_starters ENABLE ROW LEVEL SECURITY;

-- Authenticated users (frontend): read active rows only.
CREATE POLICY "Users read active starters"
  ON prompt_starters
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Service role (MView-Admin, seed scripts): full access — bypasses RLS by default.

-- ── 4. SEED: CANONICAL V1 DATA ───────────────────────────────────────────────
-- 70 prompts from prompt_starters_canonical_v1.json
-- display_order set per insertion sequence within each persona group.

INSERT INTO prompt_starters
  (id, persona_type, prompt_text, follow_ups, workflow, surface, campaign, display_order, requires_professional_gate, source_version)
VALUES

-- ── A. Legacy / Inherited Owner (10 prompts) ─────────────────────────────────
(
  'ps_i_just_inherited_minerals_what_are_my_first_three_steps',
  'legacy_inherited_owner',
  'I just inherited minerals — what are my first three steps?',
  ARRAY[
    'What does my ownership record show about this lease?',
    'How do I notify the operator I am the new owner?'
  ],
  'explain_ownership', 'prompt_starters_inside_product', 'inheritance_moment', 10, false, 'v1'
),
(
  'ps_explain_this_division_order_in_plain_english',
  'legacy_inherited_owner',
  'Explain this ''Division Order'' in plain English.',
  ARRAY[
    'Who else shares ownership in this lease?',
    'How do I confirm my ownership share?'
  ],
  'explain_ownership', 'faq_help_center_questions', 'inheritance_moment', 20, false, 'v1'
),
(
  'ps_how_do_i_notify_the_operator_i_am_the_new_owner',
  'legacy_inherited_owner',
  'How do I notify the operator I am the new owner?',
  ARRAY[
    'How quickly can I search my name and claim my leases?',
    'What information do I need to complete the claim process?'
  ],
  'explain_ownership', 'prompt_starters_inside_product', 'inheritance_moment', 30, false, 'v1'
),
(
  'ps_what_does_my_ownership_record_show_about_this_lease',
  'legacy_inherited_owner',
  'What does my ownership record show about this lease?',
  ARRAY[
    'Can I also search using lease name, lease number, or owner name?',
    'Can I find wells using API number and see nearby activity?'
  ],
  'explain_ownership', 'prompt_starters_inside_product', 'inheritance_moment', 40, false, 'v1'
),
(
  'ps_what_information_is_included_in_a_full_digital_profile',
  'legacy_inherited_owner',
  'What information is included in a full digital profile for my Texas oil and gas lease?',
  ARRAY[
    'Can I see all wells tied to my oil and gas lease in one place?',
    'Can I review the lease''s production, operator, and activity history together?'
  ],
  'portfolio_overview', 'prompt_starters_inside_product', 'inheritance_moment', 50, false, 'v1'
),
(
  'ps_can_i_generate_a_full_report_for_my_oil_and_gas_lease',
  'legacy_inherited_owner',
  'Can I generate a full report for my oil and gas lease?',
  ARRAY[
    'What details are included in the full lease report?',
    'Can I download the full lease report for my oil and gas lease?'
  ],
  'portfolio_overview', 'prompt_starters_inside_product', 'inheritance_moment', 60, false, 'v1'
),
(
  'ps_can_i_see_a_databased_estimate_of_what_my_mineral_estate_may_be_worth',
  'legacy_inherited_owner',
  'Can I see a data-based estimate of what my mineral estate may be worth before handing it down to my heirs?',
  ARRAY[
    'Which of my wells and leases look the strongest right now?',
    'How much future income may still come from each lease or well?'
  ],
  'mineral_valuation_estimate', 'trust_building_before_product_action', 'inheritance_moment', 70, false, 'v1'
),
(
  'ps_can_i_see_my_estimated_mineral_value_and_total_net_worth',
  'legacy_inherited_owner',
  'Can I see my estimated mineral value once my leases are claimed, without building spreadsheets myself?',
  ARRAY[
    'Can I see both my total mineral value and each lease value in one place?',
    'What data is already built in to help estimate my mineral value?'
  ],
  'mineral_valuation_estimate', 'prompt_starters_inside_product', 'inheritance_moment', 80, false, 'v1'
),
(
  'ps_what_is_decline_curve_analysis_in_simple_terms',
  'legacy_inherited_owner',
  'What is Decline Curve Analysis in simple terms?',
  ARRAY[
    'How do you use past production to estimate what may still be left in my oil and gas lease?',
    'How much estimated oil and gas reserve is still left in my lease or wells?'
  ],
  'educational_content_lookup', 'public_educational_content', 'inheritance_moment', 90, false, 'v1'
),
(
  'ps_can_i_search_for_a_tract_using_county_abstract_number_or_section',
  'legacy_inherited_owner',
  'Can I search for a tract using county, abstract number, or section?',
  ARRAY[
    'Can I also search using lease name, lease number, or owner name?',
    'Can I find wells using API number and see nearby activity?'
  ],
  'explain_ownership', 'prompt_starters_inside_product', 'inheritance_moment', 100, false, 'v1'
),

-- ── B. Passive Income Owner (16 prompts) ──────────────────────────────────────
(
  'ps_are_there_significant_changes_in_my_revenue_this_month',
  'passive_income_owner',
  'Are there significant changes in my revenue this month?',
  ARRAY[
    'Can you break down my lease revenue year by year?',
    'Does my latest check match my historical average?'
  ],
  'production_change_analysis', 'prompt_starters_inside_product', 'check_change_moment', 10, false, 'v1'
),
(
  'ps_scan_for_new_permits_or_drilling_activity',
  'passive_income_owner',
  'Scan for new permits or drilling activity.',
  ARRAY[
    'Can I filter activity by lease, operator, county, and date?',
    'Can I also see nearby lease activity that may affect my oil and gas lease?'
  ],
  'nearby_drilling_activity', 'prompt_starters_inside_product', 'check_change_moment', 20, false, 'v1'
),
(
  'ps_does_my_latest_check_match_my_historical_average',
  'passive_income_owner',
  'Does my latest check match my historical average?',
  ARRAY[
    'Can you show total oil and gas produced from my lease?',
    'Can I see the latest reported oil, gas, and BOE volumes for my well?'
  ],
  'production_change_analysis', 'direct_intelligence_questions', 'check_change_moment', 30, false, 'v1'
),
(
  'ps_show_me_a_complete_view_of_my_oil_and_gas_lease',
  'passive_income_owner',
  'Show me a complete view of my oil and gas lease',
  ARRAY[
    'Can you show my production, value, and ownership details together?',
    'How do I see my share and earnings across all my leases?'
  ],
  'portfolio_overview', 'prompt_starters_inside_product', 'check_change_moment', 40, false, 'v1'
),
(
  'ps_how_much_oil_and_gas_has_my_lease_produced_so_far',
  'passive_income_owner',
  'How much oil and gas has my lease produced so far?',
  ARRAY[
    'Can you show total oil and gas produced from my lease?',
    'How much oil and gas is still left in my lease?'
  ],
  'production_change_analysis', 'direct_intelligence_questions', 'check_change_moment', 50, false, 'v1'
),
(
  'ps_are_my_wells_currently_producing_or_idle',
  'passive_income_owner',
  'Are my wells currently producing or idle?',
  ARRAY[
    'Can you show the status of each well on my lease?',
    'How many wells are producing versus shut-in on my lease?'
  ],
  'well_performance_analysis', 'direct_intelligence_questions', 'check_change_moment', 60, false, 'v1'
),
(
  'ps_is_my_operator_actively_working_on_my_lease_or_not',
  'passive_income_owner',
  'Is my operator actively working on my lease or not?',
  ARRAY[
    'How many wells on my lease are currently producing versus inactive?',
    'Has there been any recent drilling or production activity on my lease?'
  ],
  'operator_activity_analysis', 'direct_intelligence_questions', 'check_change_moment', 70, false, 'v1'
),
(
  'ps_how_dense_is_the_oil_and_gas_activity_around_my_property',
  'passive_income_owner',
  'How dense is the oil and gas activity around my property?',
  ARRAY[
    'How many wells are located within 1 mile, 3 miles, and 5 miles of my property?',
    'Who owns or operates the nearby wells and leases, and how are they performing?'
  ],
  'nearby_drilling_activity', 'direct_intelligence_questions', 'check_change_moment', 80, false, 'v1'
),
(
  'ps_can_i_estimate_my_royalty_income_for_the_next_six_years',
  'passive_income_owner',
  'Can I estimate my royalty income for the next six years?',
  ARRAY[
    'Can I also see the projected production behind my future royalty income?',
    'How is future production estimated for each oil and gas lease?'
  ],
  'mineral_valuation_estimate', 'direct_intelligence_questions', 'check_change_moment', 90, false, 'v1'
),
(
  'ps_can_i_see_how_my_royalty_checks_may_change_and_plan_a_budget',
  'passive_income_owner',
  'Can I see future royalty payout estimates to plan a realistic budget?',
  ARRAY[
    'Can I view the month-by-month royalty income tied to my share in the oil and gas lease?',
    'How much total royalty income could I receive over the next six years?'
  ],
  'mineral_valuation_estimate', 'direct_intelligence_questions', 'check_change_moment', 100, false, 'v1'
),
(
  'ps_can_i_see_operator_activity_from_texas_railroad_commission_in_my_dashboard',
  'passive_income_owner',
  'Can I see operator activity from Texas Railroad Commission records inside my dashboard?',
  ARRAY[
    'Can I track operator activity for a specific lease, county, or date range?',
    'Can I search for updates on one oil and gas lease by name?',
    'Can I also see nearby lease activity that may affect my oil and gas lease?'
  ],
  'operator_activity_analysis', 'prompt_starters_inside_product', 'check_change_moment', 110, false, 'v1'
),
(
  'ps_can_i_see_the_previous_and_current_status_of_an_oil_and_gas_lease',
  'passive_income_owner',
  'Can I see the previous status and current status of an oil and gas lease?',
  ARRAY[
    'Can I quickly check whether my well is producing or shut-in?',
    'Can I also see when that status change happened?'
  ],
  'well_performance_analysis', 'direct_intelligence_questions', 'check_change_moment', 120, false, 'v1'
),
(
  'ps_can_i_see_monthly_oil_and_gas_production_for_my_well',
  'passive_income_owner',
  'Can I see monthly oil and gas production for my well?',
  ARRAY[
    'How does this well''s monthly production trend over time?',
    'Is this well producing more or less compared to others on the same lease?'
  ],
  'production_change_analysis', 'direct_intelligence_questions', 'check_change_moment', 130, false, 'v1'
),
(
  'ps_can_i_filter_the_map_to_see_new_drilling_permits_in_my_area',
  'passive_income_owner',
  'Can I filter the map to see new drilling permits in my area?',
  ARRAY[
    'Can I identify which permits are approved but not yet drilled?',
    'Can I track new drilling activity near my lease using the map?'
  ],
  'nearby_drilling_activity', 'prompt_starters_inside_product', 'check_change_moment', 140, false, 'v1'
),
(
  'ps_can_i_see_pooled_unit_boundaries_on_the_map',
  'passive_income_owner',
  'Can I see pooled unit boundaries on the map?',
  ARRAY[
    'Can I check if my specific acreage falls within a pooled unit?',
    'Can I compare my tract with surrounding lease boundaries and wells?'
  ],
  'explain_ownership', 'direct_intelligence_questions', 'check_change_moment', 150, false, 'v1'
),
(
  'ps_can_i_see_the_top_operators_by_production_in_my_area',
  'passive_income_owner',
  'Can I see the top operators by production in my area?',
  ARRAY[
    'Can I identify the top 5 or top 10 operators in my county?',
    'Can I compare production volumes between these operators?'
  ],
  'operator_activity_analysis', 'direct_intelligence_questions', 'check_change_moment', 160, false, 'v1'
),

-- ── C. Active Deal-Seeking Owner (5 prompts) ──────────────────────────────────
(
  'ps_compare_my_lease_offer_to_nearby_verified_comps',
  'active_deal_seeking_owner',
  'Compare my lease offer to nearby verified comps.',
  ARRAY[
    'Can I see my lease''s current estimated value and future royalty potential side by side?',
    'What lease activity, production, or operator trends should I review before deciding to sell or hold?'
  ],
  'evaluate_lease_offer', 'trust_building_before_product_action', 'offer_evaluation', 10, false, 'v1'
),
(
  'ps_is_a_20_percent_royalty_standard_for_this_activity',
  'active_deal_seeking_owner',
  'Is a 20% royalty standard for this activity?',
  ARRAY[
    'Can I see my lease''s current estimated value and future royalty potential side by side?',
    'Can I compare my current lease value with future royalty income potential?'
  ],
  'evaluate_lease_offer', 'direct_intelligence_questions', 'offer_evaluation', 20, false, 'v1'
),
(
  'ps_how_active_is_this_operator_in_my_county_based_on_recent_permits',
  'active_deal_seeking_owner',
  'How active is this operator in my county based on recent permits?',
  ARRAY[
    'Can I see where this operator is active across Texas?',
    'Can I compare operators working in the same basin or county?'
  ],
  'operator_activity_analysis', 'trust_building_before_product_action', 'offer_evaluation', 30, false, 'v1'
),
(
  'ps_what_hard_data_can_i_review_before_deciding_whether_to_accept_an_offer',
  'active_deal_seeking_owner',
  'What hard data can I review before deciding whether to accept an offer or keep my mineral rights?',
  ARRAY[
    'Can I see the projected production and remaining reserves for my producing wells?',
    'How active is the area around my oil and gas lease, and what does that suggest about future potential?'
  ],
  'evaluate_lease_offer', 'trust_building_before_product_action', 'offer_evaluation', 40, false, 'v1'
),
(
  'ps_what_is_the_value_of_my_oil_and_gas_lease',
  'active_deal_seeking_owner',
  'What is the value of my oil and gas lease?',
  ARRAY[
    'Can you show the value of my lease based on my ownership share?',
    'Is this a good time to sell my lease?'
  ],
  'mineral_valuation_estimate', 'direct_intelligence_questions', 'offer_evaluation', 50, false, 'v1'
),

-- ── D. Sophisticated Portfolio Owner (20 prompts) ─────────────────────────────
(
  'ps_explain_the_production_variance_between_q1_and_q4',
  'sophisticated_portfolio_owner',
  'Explain the production variance between Q1 and Q4.',
  ARRAY[
    'Can I see gas, oil, and active well counts side by side for each lease?',
    'Can I compare my past revenue with my next six years of estimated income?'
  ],
  'production_change_analysis', 'direct_intelligence_questions', 'intelligence_layer', 10, false, 'v1'
),
(
  'ps_identify_assets_underperforming_their_projected_decline',
  'sophisticated_portfolio_owner',
  'Identify assets underperforming their projected decline.',
  ARRAY[
    'How much oil and gas is left in my lease?',
    'Show me how much my lease has produced versus what is left.'
  ],
  'well_performance_analysis', 'direct_intelligence_questions', 'intelligence_layer', 20, false, 'v1'
),
(
  'ps_explain_how_nri_weighted_yield_is_derived_from_my_data',
  'sophisticated_portfolio_owner',
  'Explain how NRI-weighted yield is derived from my data.',
  ARRAY[
    'Can I see estimated oil and gas reserves based on my decimal interest?',
    'Can I compare total lease reserves with the share tied to my mineral interest?'
  ],
  'portfolio_overview', 'direct_intelligence_questions', 'intelligence_layer', 30, false, 'v1'
),
(
  'ps_show_me_my_future_cash_flow_from_my_oil_and_gas_lease',
  'sophisticated_portfolio_owner',
  'Show me my future cash flow from my oil and gas lease',
  ARRAY[
    'How much income could this lease generate over the next few years?',
    'What assumptions are used in the cash flow projection?'
  ],
  'mineral_valuation_estimate', 'direct_intelligence_questions', 'intelligence_layer', 40, false, 'v1'
),
(
  'ps_can_i_see_the_total_estimated_value_of_all_my_mineral_rights',
  'sophisticated_portfolio_owner',
  'Can I see the total estimated value of all my mineral rights in one place?',
  ARRAY[
    'Can I also see the estimated value of each oil and gas lease separately?',
    'How is the estimated value calculated for my oil and gas leases?'
  ],
  'mineral_valuation_estimate', 'direct_intelligence_questions', 'intelligence_layer', 50, false, 'v1'
),
(
  'ps_can_i_see_the_current_estimated_value_of_each_lease_in_my_portfolio',
  'sophisticated_portfolio_owner',
  'Can I see the current estimated value of each oil and gas lease in my portfolio?',
  ARRAY[
    'Can I compare all my lease values side by side in one portfolio view?',
    'Can I also see which leases are contributing the most to my total mineral value?'
  ],
  'mineral_valuation_estimate', 'direct_intelligence_questions', 'intelligence_layer', 60, false, 'v1'
),
(
  'ps_what_will_my_lease_produce_and_how_much_is_left',
  'sophisticated_portfolio_owner',
  'What is the total production my lease will deliver over its remaining life?',
  ARRAY[
    'Which wells on my lease have the most reserves remaining?',
    'How will production from my lease decline over time?'
  ],
  'mineral_valuation_estimate', 'direct_intelligence_questions', 'intelligence_layer', 70, false, 'v1'
),
(
  'ps_show_me_how_much_my_lease_has_produced_versus_what_is_left',
  'sophisticated_portfolio_owner',
  'Show me how much my lease has produced versus what is left',
  ARRAY[
    'Which wells are contributing most to remaining reserves?',
    'How much production life is left in my lease based on current trends?'
  ],
  'well_performance_analysis', 'direct_intelligence_questions', 'intelligence_layer', 80, false, 'v1'
),
(
  'ps_how_much_oil_and_gas_is_being_produced_per_acre_on_my_lease',
  'sophisticated_portfolio_owner',
  'How much oil and gas is being produced per acre on my lease?',
  ARRAY[
    'Can you calculate production per acre for my lease?',
    'How does my lease''s production efficiency compare to nearby leases?'
  ],
  'well_performance_analysis', 'direct_intelligence_questions', 'intelligence_layer', 90, false, 'v1'
),
(
  'ps_how_can_i_see_the_full_production_history_and_forecast_of_my_well',
  'sophisticated_portfolio_owner',
  'How can I see the full production history and forecast future output for my well?',
  ARRAY[
    'What does the decline curve look like for this well?',
    'Is this decline normal or faster than expected?'
  ],
  'well_performance_analysis', 'direct_intelligence_questions', 'intelligence_layer', 100, false, 'v1'
),
(
  'ps_can_i_see_well_construction_details_like_tvd_and_perforation_depths',
  'sophisticated_portfolio_owner',
  'Can I see well construction details like TVD and perforation depths?',
  ARRAY[
    'Can I view both the surface location and bottom hole location of the well?',
    'Can I check details like API number, well type, and lease name from the map?'
  ],
  'well_performance_analysis', 'direct_intelligence_questions', 'intelligence_layer', 110, false, 'v1'
),
(
  'ps_can_i_see_estimated_oil_and_gas_reserves_based_on_my_decimal_interest',
  'sophisticated_portfolio_owner',
  'Can I see estimated oil and gas reserves based on my decimal interest?',
  ARRAY[
    'Can I compare total lease reserves with the share tied to my mineral interest?',
    'How much future income could my share of those reserves still generate?'
  ],
  'well_performance_analysis', 'direct_intelligence_questions', 'intelligence_layer', 120, false, 'v1'
),
(
  'ps_can_i_see_all_my_leases_across_different_counties_in_one_table',
  'sophisticated_portfolio_owner',
  'Can I see all my oil and gas leases across different counties in one table?',
  ARRAY[
    'Can I compare my leases side by side in one standardized view?',
    'Can I also see the value, production, and other key details for each lease in that table?'
  ],
  'portfolio_overview', 'prompt_starters_inside_product', 'intelligence_layer', 130, false, 'v1'
),
(
  'ps_can_i_compare_my_past_revenue_with_my_next_six_years_of_estimated_income',
  'sophisticated_portfolio_owner',
  'Can I compare my past revenue with my next six years of estimated income?',
  ARRAY[
    'Can I see that comparison lease by lease or based on my personal share?',
    'Can I also see the production behind those past and future income numbers?'
  ],
  'portfolio_overview', 'direct_intelligence_questions', 'intelligence_layer', 140, false, 'v1'
),
(
  'ps_can_i_see_gas_oil_and_active_well_counts_side_by_side_for_each_lease',
  'sophisticated_portfolio_owner',
  'Can I see gas, oil, and active well counts side by side for each lease?',
  ARRAY[
    'Can I compare those numbers across all my leases in one place?',
    'Can I also see which leases look strongest based on production and well activity?'
  ],
  'production_change_analysis', 'direct_intelligence_questions', 'intelligence_layer', 150, false, 'v1'
),
(
  'ps_what_are_nearby_operators_doing_and_is_drilling_moving_toward_my_lease',
  'sophisticated_portfolio_owner',
  'What are nearby operators doing that could signal new development near my property?',
  ARRAY[
    'How many new permits have been filed within 1 mile, 3 miles, and 5 miles of my oil and gas lease?',
    'Do nearby well paths or new permits suggest development is moving toward my lease?'
  ],
  'nearby_drilling_activity', 'direct_intelligence_questions', 'intelligence_layer', 160, false, 'v1'
),
(
  'ps_can_i_see_the_chance_of_a_new_well_being_drilled_on_my_lease',
  'sophisticated_portfolio_owner',
  'Can I see the chance of a new well being drilled on my oil and gas lease?',
  ARRAY[
    'How strong is the drilling activity around my oil and gas lease right now?',
    'Has my operator been drilling new wells recently on or near my lease?'
  ],
  'nearby_drilling_activity', 'direct_intelligence_questions', 'intelligence_layer', 170, false, 'v1'
),
(
  'ps_can_i_track_one_operators_drilling_activity_across_texas',
  'sophisticated_portfolio_owner',
  'Can I track one operator''s drilling activity across Texas or in a specific county?',
  ARRAY[
    'Can I filter that operator''s activity by date to see what they have filed recently?',
    'Can I also see whether that operator is becoming more active near my oil and gas lease?'
  ],
  'operator_activity_analysis', 'prompt_starters_inside_product', 'intelligence_layer', 180, false, 'v1'
),
(
  'ps_can_i_analyze_operator_performance_and_compare_in_my_county',
  'sophisticated_portfolio_owner',
  'Can I analyze an operator''s production efficiency and compare it with others in my county?',
  ARRAY[
    'Can I rank operators based on production volume in my area?',
    'Can I compare extraction efficiency and decline trends between operators?'
  ],
  'operator_activity_analysis', 'direct_intelligence_questions', 'intelligence_layer', 190, false, 'v1'
),
(
  'ps_can_i_see_all_recent_filings_for_a_specific_area_to_spot_development_trends',
  'sophisticated_portfolio_owner',
  'Can I see all recent filings for a specific area to spot development trends?',
  ARRAY[
    'Can I narrow those filings by county, date, or operator?',
    'Can I use that activity to see whether development is moving closer to my oil and gas lease?'
  ],
  'operator_activity_analysis', 'direct_intelligence_questions', 'intelligence_layer', 200, false, 'v1'
),

-- ── E. Distrustful / Burned Owner (13 prompts) ────────────────────────────────
(
  'ps_show_the_state_filing_that_matches_my_check_stub_volume',
  'distrustful_burned_owner',
  'Show the state filing that matches my check stub volume.',
  ARRAY[
    'Can I open the original Railroad Commission reports for new permits and completions?',
    'Can I compare my lease production with official Texas Railroad Commission data?'
  ],
  'explain_ownership', 'trust_building_before_product_action', 'trust_verification', 10, false, 'v1'
),
(
  'ps_identify_the_discrepancy_in_my_payout_decimal',
  'distrustful_burned_owner',
  'Identify the discrepancy in my payout decimal.',
  ARRAY[
    'Can I enter and verify my decimal interest for each oil and gas lease?',
    'Can I see the difference between full lease value and my personal share based on my decimal interest?'
  ],
  'explain_ownership', 'trust_building_before_product_action', 'trust_verification', 20, false, 'v1'
),
(
  'ps_what_is_the_source_timestamp_for_this_production_data',
  'distrustful_burned_owner',
  'What is the source timestamp for this production data?',
  ARRAY[
    'Can I see the latest reported oil, gas, and BOE volumes for my well?',
    'Can I compare those reported volumes with my royalty statements?'
  ],
  'explain_ownership', 'trust_building_before_product_action', 'trust_verification', 30, false, 'v1'
),
(
  'ps_who_is_the_operator_of_my_oil_and_gas_lease',
  'distrustful_burned_owner',
  'Who is the operator of my oil and gas lease?',
  ARRAY[
    'Can you show me the current operator for my lease?',
    'Has the operator of my lease changed over time?'
  ],
  'explain_ownership', 'trust_building_before_product_action', 'trust_verification', 40, false, 'v1'
),
(
  'ps_how_is_my_operator_performing_compared_to_others_in_texas',
  'distrustful_burned_owner',
  'How is my operator performing compared to others in Texas?',
  ARRAY[
    'Is my operator among the top producers in Texas?',
    'Where is my operator most active and producing across Texas?'
  ],
  'operator_activity_analysis', 'trust_building_before_product_action', 'trust_verification', 50, false, 'v1'
),
(
  'ps_does_mineral_view_use_my_decimal_interest_and_current_market_prices',
  'distrustful_burned_owner',
  'Does Mineral View use my decimal interest and current market prices in the calculation?',
  ARRAY[
    'Can I see the difference between full lease value and my personal share based on my decimal interest?',
    'How do current oil and gas prices affect my estimated future income?'
  ],
  'mineral_valuation_estimate', 'trust_building_before_product_action', 'trust_verification', 60, false, 'v1'
),
(
  'ps_can_i_enter_and_verify_my_decimal_interest_for_each_lease',
  'distrustful_burned_owner',
  'Can I enter and verify my decimal interest for each oil and gas lease?',
  ARRAY[
    'Will my decimal interest change the value and income estimates shown for my lease?',
    'Can I compare the full lease numbers with my personal share based on my decimal interest?'
  ],
  'portfolio_overview', 'trust_building_before_product_action', 'trust_verification', 70, false, 'v1'
),
(
  'ps_can_i_compare_my_lease_production_with_official_texas_rrc_data',
  'distrustful_burned_owner',
  'Can I compare my lease production with official Texas Railroad Commission data?',
  ARRAY[
    'Can I see the production history for my oil and gas lease in one place?',
    'Can I use that production history to check whether my royalty payments look right?'
  ],
  'production_change_analysis', 'trust_building_before_product_action', 'trust_verification', 80, false, 'v1'
),
(
  'ps_can_i_review_detailed_monthly_revenue_data_for_my_leases',
  'distrustful_burned_owner',
  'Can I review detailed monthly revenue data for my oil and gas leases?',
  ARRAY[
    'Can I match that revenue data with my decimal interest and lease-level production?',
    'Can I use that detail to check whether my monthly royalty payments look right?'
  ],
  'production_change_analysis', 'trust_building_before_product_action', 'trust_verification', 90, false, 'v1'
),
(
  'ps_can_i_open_original_rrc_reports_and_access_scanned_attachments',
  'distrustful_burned_owner',
  'Can I open original Railroad Commission reports and access scanned attachments like plats, diagrams, and W-1 forms?',
  ARRAY[
    'Can I do that for a specific lease, operator, or date range?',
    'Can I also access the related RRC report for that activity?'
  ],
  'operator_activity_analysis', 'trust_building_before_product_action', 'trust_verification', 100, false, 'v1'
),
(
  'ps_can_i_see_the_latest_reported_oil_gas_and_boe_volumes_for_my_well',
  'distrustful_burned_owner',
  'Can I see the latest reported oil, gas, and BOE volumes for my well?',
  ARRAY[
    'Can I compare those reported volumes with my royalty statements?',
    'Can I also review the production history for that well in one place?'
  ],
  'production_change_analysis', 'trust_building_before_product_action', 'trust_verification', 110, false, 'v1'
),
(
  'ps_can_i_check_the_official_operator_and_api_number_for_a_specific_well',
  'distrustful_burned_owner',
  'Can I check the official operator and API number for a specific well?',
  ARRAY[
    'Can I also see which lease that well belongs to?',
    'Can I view official filings like W-1 forms and directional surveys for this well?'
  ],
  'explain_ownership', 'trust_building_before_product_action', 'trust_verification', 120, false, 'v1'
),
(
  'ps_can_i_check_if_a_well_is_active_shutin_or_plugged_on_the_map',
  'distrustful_burned_owner',
  'Can I check if a well is active, shut-in, or plugged on the map?',
  ARRAY[
    'Can I filter wells based on their current status in a specific area?',
    'Can I search for wells using lease name or owner details and check their status?'
  ],
  'explain_ownership', 'trust_building_before_product_action', 'trust_verification', 130, false, 'v1'
),

-- ── F. Landman / Acquisition Analyst (3 prompts, gated) ──────────────────────
(
  'ps_identify_potential_base_case_eur_revisions_based_on_recent_flowback',
  'landman_acquisition_analyst',
  'Identify potential base-case EUR revisions based on recent flow-back.',
  ARRAY[
    'Show hyperbolic model parameters (b value, Di, projected life).',
    'How does this well''s performance compare to the basin average?'
  ],
  'well_performance_analysis', 'direct_intelligence_questions', 'acquisition_analysis', 10, true, 'v1'
),
(
  'ps_show_hyperbolic_model_parameters_b_value_di_projected_life',
  'landman_acquisition_analyst',
  'Show hyperbolic model parameters (b value, Di, projected life).',
  ARRAY[
    'Identify potential base-case EUR revisions based on recent flow-back.',
    'Show EUR/acre with spatial grid context for this well.'
  ],
  'well_performance_analysis', 'direct_intelligence_questions', 'acquisition_analysis', 20, true, 'v1'
),
(
  'ps_show_eur_per_acre_with_spatial_grid_context_for_this_well',
  'landman_acquisition_analyst',
  'Show EUR/acre with spatial grid context for this well.',
  ARRAY[
    'Show hyperbolic model parameters (b value, Di, projected life).',
    'How does this well''s EUR/acre compare to the basin median?'
  ],
  'well_performance_analysis', 'direct_intelligence_questions', 'acquisition_analysis', 30, true, 'v1'
),

-- ── G. Estate / Mineral Manager (3 prompts, gated) ────────────────────────────
(
  'ps_show_a_portfolio_summary_for_this_client_active_wells_and_npv',
  'estate_mineral_manager',
  'Show a portfolio summary for this client — active wells and NPV.',
  ARRAY[
    'Prepare an Interests table report including NRI and EUR/acre.',
    'Identify revenue distribution anomalies and missing payments.'
  ],
  'portfolio_overview', 'direct_intelligence_questions', 'portfolio_management', 10, true, 'v1'
),
(
  'ps_identify_revenue_distribution_anomalies_and_missing_payments',
  'estate_mineral_manager',
  'Identify revenue distribution anomalies and missing payments.',
  ARRAY[
    'Show a portfolio summary for this client — active wells and NPV.',
    'Which client accounts have the largest outstanding anomalies?'
  ],
  'production_change_analysis', 'direct_intelligence_questions', 'portfolio_management', 20, true, 'v1'
),
(
  'ps_prepare_an_interests_table_report_including_nri_and_eur_per_acre',
  'estate_mineral_manager',
  'Prepare an Interests table report including NRI and EUR/acre.',
  ARRAY[
    'Show a portfolio summary for this client — active wells and NPV.',
    'Can I generate a PDF owner report from this Interests table?'
  ],
  'portfolio_overview', 'direct_intelligence_questions', 'portfolio_management', 30, true, 'v1'
);

-- ── 5. VIEWS ──────────────────────────────────────────────────────────────────

-- Primary hook query as a view — stable contract for usePersona().
CREATE VIEW active_prompt_starters AS
  SELECT
    id,
    persona_type,
    prompt_text,
    follow_ups,
    workflow,
    surface,
    campaign,
    display_order,
    requires_professional_gate,
    ab_test_group
  FROM prompt_starters
  WHERE is_active = true
  ORDER BY persona_type, display_order ASC;

-- Admin view: full row including audit fields.
CREATE VIEW prompt_starters_admin AS
  SELECT * FROM prompt_starters
  ORDER BY persona_type, display_order ASC;
