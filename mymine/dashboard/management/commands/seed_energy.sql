-- Clear existing data
DELETE FROM dashboard_energyusage;

-- Reset the sequence
DELETE FROM sqlite_sequence WHERE name='dashboard_energyusage';

-- Insert sample data for November and December 2024
WITH RECURSIVE dates(date) AS (
  VALUES('2024-11-01')
  UNION ALL
  SELECT date(date, '+1 day')
  FROM dates
  WHERE date < '2024-12-15'
)
INSERT INTO dashboard_energyusage (
  date,
  electricity_kwh,
  electricity_cost,
  diesel_liters,
  diesel_cost,
  total_cost,
  created_at,
  updated_at
)
SELECT
  date,
  1000.00 as electricity_kwh,  -- Base electricity usage
  1500.00 as electricity_cost, -- $1.50 per kWh
  500.00 as diesel_liters,     -- Base diesel usage
  1000.00 as diesel_cost,      -- $2.00 per liter
  2500.00 as total_cost,       -- Total cost
  datetime('now') as created_at,
  datetime('now') as updated_at
FROM dates;
