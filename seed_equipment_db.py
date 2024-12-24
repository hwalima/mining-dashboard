import sqlite3
import random
from datetime import datetime, timedelta

def create_tables(cursor):
    # Create equipment table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        value_usd DECIMAL(10, 2),
        last_service_date DATE,
        next_service_date DATE,
        service_interval_days INTEGER
    )
    ''')

    # Create equipment running times table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS equipment_running_time (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        equipment_id INTEGER NOT NULL,
        total_running_hours DECIMAL(5, 2) NOT NULL,
        remarks TEXT,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id),
        UNIQUE(date, equipment_id)
    )
    ''')

def seed_equipment(cursor):
    # Sample equipment data
    equipment_data = [
        ('Excavator XL2000', 'Heavy-duty mining excavator', 250000.00, '2023-12-15', '2024-01-15', 30),
        ('Dump Truck DT500', 'Large capacity dump truck', 180000.00, '2023-12-20', '2024-01-20', 30),
        ('Drill Rig DR100', 'Precision drilling equipment', 320000.00, '2023-12-10', '2024-01-10', 30)
    ]
    
    cursor.executemany('''
    INSERT INTO equipment (name, description, value_usd, last_service_date, next_service_date, service_interval_days)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', equipment_data)

def seed_running_times(cursor):
    # Get all equipment IDs
    cursor.execute('SELECT id FROM equipment')
    equipment_ids = [row[0] for row in cursor.fetchall()]
    
    # Generate dates from Jan 1, 2024 to Dec 24, 2024
    start_date = datetime(2024, 1, 1)
    end_date = datetime(2024, 12, 24)
    
    remarks_list = [
        "Normal operation",
        "Scheduled maintenance",
        "Minor repairs needed",
        "Operating at full capacity",
        "Regular inspection completed"
    ]
    
    # Generate running time records
    running_time_data = []
    current_date = start_date
    while current_date <= end_date:
        for equipment_id in equipment_ids:
            running_hours = round(random.uniform(4, 12), 2)
            remark = random.choice(remarks_list)
            running_time_data.append((
                current_date.strftime('%Y-%m-%d'),
                equipment_id,
                running_hours,
                remark
            ))
        current_date += timedelta(days=1)
    
    cursor.executemany('''
    INSERT INTO equipment_running_time (date, equipment_id, total_running_hours, remarks)
    VALUES (?, ?, ?, ?)
    ''', running_time_data)

def main():
    # Connect to database
    conn = sqlite3.connect('mymine.db')
    cursor = conn.cursor()
    
    try:
        # Create tables
        create_tables(cursor)
        
        # Clear existing data
        cursor.execute('DELETE FROM equipment_running_time')
        cursor.execute('DELETE FROM equipment')
        
        # Seed data
        seed_equipment(cursor)
        seed_running_times(cursor)
        
        # Commit changes
        conn.commit()
        
        # Verify the number of records
        cursor.execute('SELECT COUNT(*) FROM equipment')
        equipment_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM equipment_running_time')
        running_times_count = cursor.fetchone()[0]
        
        print(f"Created {equipment_count} equipment records")
        print(f"Created {running_times_count} running time records")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    main()
