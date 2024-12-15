-- MyMine: Gold Mine Production Management System
-- SQLite Database Schema
-- Generated on 2024-12-08

-- User Management Tables
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES user_roles(id)
);

CREATE TABLE user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,  -- e.g., 'Admin', 'Manager', 'Operator'
    description TEXT
);

CREATE TABLE role_permissions (
    role_id INTEGER,
    permission_name TEXT,
    PRIMARY KEY (role_id, permission_name),
    FOREIGN KEY (role_id) REFERENCES user_roles(id)
);

-- Mining Site and Department Management
CREATE TABLE mining_sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT,
    area_hectares REAL,
    geological_classification TEXT,
    active_status BOOLEAN DEFAULT TRUE,
    estimated_gold_reserves REAL  -- in metric tons
);

CREATE TABLE mining_departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    site_id INTEGER,
    department_head_id INTEGER,
    FOREIGN KEY (site_id) REFERENCES mining_sites(id),
    FOREIGN KEY (department_head_id) REFERENCES users(id)
);

-- Equipment and Machinery
CREATE TABLE heavy_machinery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    model TEXT,
    serial_number TEXT UNIQUE,
    purchase_date DATE,
    last_maintenance_date DATE,
    department_id INTEGER,
    operational_status TEXT,  -- 'Active', 'Maintenance', 'Retired'
    FOREIGN KEY (department_id) REFERENCES mining_departments(id)
);

CREATE TABLE gold_milling_equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    capacity_tons_per_hour REAL,
    efficiency_percentage REAL,
    current_status TEXT
);

-- Daily Operational Data
CREATE TABLE daily_production_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    site_id INTEGER,
    total_tonnage_crushed REAL,
    total_tonnage_hoisted REAL,
    gold_recovery_rate REAL,
    operational_efficiency REAL,
    FOREIGN KEY (site_id) REFERENCES mining_sites(id)
);

CREATE TABLE daily_energy_consumption (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    total_kwh REAL,
    cost_per_kwh REAL,
    total_energy_cost REAL,
    department_id INTEGER,
    FOREIGN KEY (department_id) REFERENCES mining_departments(id)
);

CREATE TABLE daily_chemicals_used (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    chemical_id INTEGER,
    quantity_used REAL,
    unit_cost REAL,
    total_cost REAL,
    FOREIGN KEY (chemical_id) REFERENCES mining_chemicals(id)
);

CREATE TABLE mining_chemicals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    chemical_formula TEXT,
    current_stock REAL,
    unit_of_measurement TEXT,
    unit_price REAL
);

-- Explosives Management
CREATE TABLE daily_explosives_used (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    explosive_id INTEGER,
    quantity_used REAL,
    blast_location TEXT,
    FOREIGN KEY (explosive_id) REFERENCES explosive_components(id)
);

CREATE TABLE explosive_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    current_stock REAL,
    unit_price REAL
);

-- Stockpile and Inventory
CREATE TABLE daily_stockpile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    site_id INTEGER,
    crushed_stockpile_volume REAL,
    milled_stockpile_volume REAL,
    FOREIGN KEY (site_id) REFERENCES mining_sites(id)
);

CREATE TABLE smelted_gold (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    total_weight REAL,
    purity_percentage REAL,
    market_value_per_gram REAL,
    total_value REAL
);

-- Financial and Profitability Tracking
CREATE TABLE daily_expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    department_id INTEGER,
    energy_cost REAL,
    chemical_cost REAL,
    labor_cost REAL,
    equipment_maintenance_cost REAL,
    total_expenses REAL,
    FOREIGN KEY (department_id) REFERENCES mining_departments(id)
);

CREATE TABLE daily_labor_cost (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    department_id INTEGER,
    total_workers INTEGER,
    total_labor_hours REAL,
    hourly_rate REAL,
    total_labor_cost REAL,
    FOREIGN KEY (department_id) REFERENCES mining_departments(id)
);

-- Safety and Environmental Tracking
CREATE TABLE safety_incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    department_id INTEGER,
    incident_type TEXT,
    severity TEXT,
    description TEXT,
    corrective_actions TEXT,
    FOREIGN KEY (department_id) REFERENCES mining_departments(id)
);

CREATE TABLE environmental_impact_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    site_id INTEGER,
    water_usage REAL,
    carbon_emissions REAL,
    waste_generated REAL,
    noise_level REAL,
    FOREIGN KEY (site_id) REFERENCES mining_sites(id)
);

-- Indexes for Performance
CREATE INDEX idx_daily_production_date ON daily_production_log(date);
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_site_active_status ON mining_sites(active_status);
