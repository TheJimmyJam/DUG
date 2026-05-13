-- Platform configuration table
-- Stores all admin-editable settings as a single JSONB row per key.
-- Currently used for pricing config (fee rates, suggested ranges, bounty defaults).

create table if not exists platform_config (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- Only admins can read/write
alter table platform_config enable row level security;

create policy "admin_read_config"  on platform_config for select using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
create policy "admin_write_config" on platform_config for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Seed default pricing config
insert into platform_config (key, value) values
(
  'pricing',
  '{
    "platformFees": {
      "consumer":     2000,
      "professional": 1500,
      "enterprise":   1000,
      "strategic":     750
    },
    "byDifficulty": {
      "1": { "label": "Straightforward", "flat": { "min": 25,  "max": 100  }, "hourly": { "min": 35,  "max": 65  } },
      "2": { "label": "Moderate",        "flat": { "min": 75,  "max": 250  }, "hourly": { "min": 50,  "max": 100 } },
      "3": { "label": "Complex",         "flat": { "min": 150, "max": 500  }, "hourly": { "min": 75,  "max": 150 } },
      "4": { "label": "Advanced",        "flat": { "min": 300, "max": 1000 }, "hourly": { "min": 100, "max": 250 } },
      "5": { "label": "Expert",          "flat": { "min": 500, "max": 2500 }, "hourly": { "min": 150, "max": 400 } }
    },
    "jobTypeOverrides": {
      "program_design":     { "min": 500,  "max": 5000  },
      "portfolio_audit":    { "min": 200,  "max": 2000  },
      "ai_benchmark":       { "min": 500,  "max": 10000 },
      "pre_broker_consult": { "min": 50,   "max": 250   },
      "coverage_dispute":   { "min": 100,  "max": 500   }
    },
    "bounty": {
      "defaultPerFind": 8,
      "suggestedMin":   5,
      "suggestedMax":   50
    }
  }'
)
on conflict (key) do nothing;
