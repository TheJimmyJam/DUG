-- =============================================================================
-- Dojo seed: first practice case
-- DOJO-2026-001  Coastal habitational renewal — 312-unit garden style
-- =============================================================================

insert into public.dojo_cases (
  code,
  slug,
  title,
  summary,
  scenario,
  primary_specialty,
  additional_specialties,
  difficulty,
  time_limit_minutes,
  packet,
  red_flag_options,
  model_rationale,
  model_premium_low_cents,
  model_premium_high_cents,
  model_recommendation,
  key_factors,
  model_red_flags,
  status
) values (
  'DOJO-2026-001',
  'coastal-habitational-renewal',
  'Coastal habitational renewal — 312-unit garden style, 3 hail losses in 4 yrs',
  'Incumbent carrier non-renewing. Broker submitting to E&S markets at +47% with $50K AOP / 5% wind ded. Insured pushing back hard on the wind deductible. Your read?',
  E'You''re reviewing a renewal submission for a 312-unit garden-style apartment complex on the Texas coast (Galveston County). The incumbent admitted carrier has issued a non-renewal effective 06/01/2026 citing CAT exposure aggregation. The retail broker is shopping E&S markets and has one quote in hand at premium of $2.21M (vs. expiring $1.50M, a +47% increase) with a $50,000 AOP deductible and a 5% wind/hail deductible.\n\nThe property:\n- 312 units across 18 buildings, built 1998–2002, 3-story garden style\n- TIV $48.2M (buildings $40.5M + BPP/loss of rents $7.7M)\n- Roofs: original architectural shingle on 14 buildings, 4 buildings replaced 2022 after Hurricane Nicholas\n- 5-year loss runs: 3 hail losses ($1.4M, $980K, $610K) and 1 named storm loss ($2.1M paid, closed)\n- Loss ratio over 5 years: 138% (incurred-to-premium)\n- Sprinkled, central station fire alarm\n- Property mgmt: regional firm, 8,200 units AUM, retained 6 years\n- Borrower has $32M outstanding on Fannie Mae loan; lender requires 80% replacement cost coverage and named windstorm\n\nThe insured is pushing back hard on the 5% wind deductible — they''re carrying it for the first time and don''t have the liquidity in reserve to absorb a $2.4M deductible event. They''re asking you whether they should accept the quote, push back on terms, or look harder.',
  'habitational',
  array['cat-wind', 'cat-flood'],
  4,
  60,
  jsonb_build_object(
    'TIV', '$48.2M',
    'Construction', '3-story garden style, 1998–2002',
    'Roofs', '14 original (24 yr) / 4 replaced 2022',
    'Loss runs', '3 hail + 1 named storm in 5 yr',
    'Loss ratio (5 yr)', '138%',
    'Expiring premium', '$1.50M',
    'Quoted premium', '$2.21M (+47%)',
    'AOP deductible', '$50,000',
    'Wind deductible', '5% per location',
    'Lender', 'Fannie Mae — requires NWS coverage'
  ),
  array[
    'Roof age / lack of fortified mitigation',
    'Loss ratio above 100%',
    'Wind deductible affordability',
    'Single CAT zone aggregation',
    'Lender NWS requirement could lock pricing',
    'No documented loss-control / impact-resistant upgrades',
    'Property manager turnover',
    'Building age outside the standard market'
  ],
  E'This is a quote that should be accepted *with modifications and conditions* — not rejected, but not as-is.\n\n**Pricing.** A +47% increase to $2.21M on TIV of $48.2M is a rate of ~46¢ per $100 — reasonable for non-admitted Tier 1 wind-exposed habitational right now, especially given a 138% 5-year loss ratio. Anything below $1.95M would be aggressive for this risk; above $2.4M you should walk and re-shop. The quote sits inside the defensible band.\n\n**Wind deductible.** The 5% is the real story. On $40.5M building TIV that''s a $2.025M retention per occurrence — likely uninsurable to the lender unless paired with a deductible buy-down or wind buy-back layer. Recommend the broker source a buy-down market (Lloyd''s, Velocity, Lexington, or a structured Lloyd''s syndicate) to cap the insured''s wind retention at 1% or $400K, whichever is lower. Costs $80–140K of additional premium typically; protects the loan covenant and the insured''s liquidity.\n\n**Roof age.** Fourteen original roofs at 24+ years are the loss-driver. Recommend the insured commission a roof condition certification and pre-fund a 24-month replacement program. Some markets will give 5–10% credit for a fortified-roof commitment; without it expect the renewal in 2027 to harden again.\n\n**Loss control.** Three hail losses suggests this complex is in a frequent hail corridor and lacks impact-resistant glazing and roof system upgrades. A loss-control survey and a Class 3 or 4 impact-resistant roof spec on the next replacement cycle is the path to long-term insurability.\n\n**Recommendation.** Accept the quote subject to (1) a wind deductible buy-down, (2) a documented roof replacement schedule with fortified-equivalent target, (3) a loss-control survey within 60 days. Walk if the buy-down market quotes >$200K — at that point the insured is better off increasing reserves and accepting the 5%, or restructuring the financing.',
  195000000,   -- $1.95M low
  240000000,   -- $2.40M high
  'quote_with_modifications',
  jsonb_build_array(
    jsonb_build_object('label', 'Loss ratio context', 'match', array['138%', 'loss ratio', 'incurred', 'frequency'], 'weight', 1),
    jsonb_build_object('label', 'Pricing reasonableness', 'match', array['46¢', 'rate', 'per $100', 'defensible', 'band', '$1.95', '$2.4'], 'weight', 1),
    jsonb_build_object('label', 'Wind deductible affordability', 'match', array['5%', 'wind deductible', 'buy-down', 'buy down', 'retention'], 'weight', 1),
    jsonb_build_object('label', 'Lender / NWS covenant', 'match', array['lender', 'fannie', 'covenant', 'nws', 'named windstorm'], 'weight', 1),
    jsonb_build_object('label', 'Roof age + replacement', 'match', array['roof', '24', 'replacement', 'fortified', 'shingle'], 'weight', 1),
    jsonb_build_object('label', 'Loss control / mitigation', 'match', array['loss control', 'mitigation', 'impact-resistant', 'class 3', 'class 4', 'survey'], 'weight', 1),
    jsonb_build_object('label', 'CAT aggregation', 'match', array['aggregat', 'tier 1', 'cat', 'corridor', 'wind zone'], 'weight', 1),
    jsonb_build_object('label', 'Path forward / recommendation', 'match', array['accept', 'subject to', 'walk', 'shop', 'recommend'], 'weight', 1)
  ),
  array[
    'Wind deductible affordability',
    'Roof age / lack of fortified mitigation',
    'Lender NWS requirement could lock pricing',
    'Loss ratio above 100%'
  ],
  'published'
)
on conflict (code) do nothing;
