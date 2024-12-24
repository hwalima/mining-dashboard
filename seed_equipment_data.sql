-- Insert sample equipment
INSERT INTO equipment (name, description, value_usd, last_service_date, next_service_date, service_interval_days) VALUES
('Excavator XL2000', 'Heavy-duty mining excavator', 250000.00, '2023-12-15', '2024-01-15', 30),
('Dump Truck DT500', 'Large capacity dump truck', 180000.00, '2023-12-20', '2024-01-20', 30),
('Drill Rig DR100', 'Precision drilling equipment', 320000.00, '2023-12-10', '2024-01-10', 30);

-- Function to generate running times (this would be done in Python, but showing the logic)
WITH RECURSIVE dates(date) AS (
  SELECT '2024-01-01'
  UNION ALL
  SELECT date(date, '+1 day')
  FROM dates
  WHERE date < '2024-12-24'
),
equipment_ids AS (
  SELECT id FROM equipment
)
INSERT INTO equipment_running_time (date, equipment_id, total_running_hours, remarks)
SELECT 
    dates.date,
    equipment_ids.id,
    ROUND(RANDOM() * (12 - 4) + 4, 2), -- Random hours between 4 and 12
    CASE (ABS(RANDOM() % 5))
        WHEN 0 THEN 'Normal operation'
        WHEN 1 THEN 'Scheduled maintenance'
        WHEN 2 THEN 'Minor repairs needed'
        WHEN 3 THEN 'Operating at full capacity'
        ELSE 'Regular inspection completed'
    END
FROM dates
CROSS JOIN equipment_ids;
