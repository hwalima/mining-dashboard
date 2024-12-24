-- Equipment Table
CREATE TABLE equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    value_usd DECIMAL(10, 2),
    last_service_date DATE,
    next_service_date DATE,
    service_interval_days INTEGER
);

-- Equipment Running Times Table
CREATE TABLE equipment_running_time (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    equipment_id INTEGER NOT NULL,
    total_running_hours DECIMAL(5, 2) NOT NULL,
    remarks TEXT,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    UNIQUE(date, equipment_id)
);

-- Create index for performance
CREATE INDEX idx_equipment_running_time_date ON equipment_running_time(date);
CREATE INDEX idx_equipment_running_time_equipment ON equipment_running_time(equipment_id);
