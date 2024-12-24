import sqlite3
from datetime import datetime

def update_equipment():
    conn = sqlite3.connect('mymine.db')
    cursor = conn.cursor()
    
    # Clear existing data
    cursor.execute('DELETE FROM equipment_running_time')
    cursor.execute('DELETE FROM equipment')
    
    # New equipment data matching the screenshot
    equipment_data = [
        ('CAT 785D Mining Truck', 'Heavy-duty off-highway mining truck with 150-ton payload capacity. Used for hauling ore and waste material.', 5500000.00, '2024-11-15', '2024-12-15', 30),
        ('Caterpillar D11T Dozer', 'Large track-type tractor for heavy ripping and bulk dozing applications.', 1500000.00, '2024-12-12', '2025-01-11', 30),
        ('Epiroc Boomer S2 Drill Rig', 'Twin-boom face drilling rig for underground development and production.', 1800000.00, '2024-12-08', '2025-01-22', 45),
        ('Hitachi EX5600 Shovel', 'Electric mining shovel with 29m³ bucket capacity for high-production loading.', 6200000.00, '2024-12-18', '2025-02-01', 45),
        ('Komatsu PC5500 Excavator', 'Large hydraulic mining excavator with 29m³ bucket capacity. Primary loading unit for waste and ore.', 4800000.00, '2024-12-15', '2025-01-29', 45),
        ('Metso MP1000 Cone Crusher', 'Secondary crusher for ore processing with capacity up to 1000 tph.', 850000.00, '2024-12-01', '2025-03-01', 90),
        ('Sandvik TH663i Underground Truck', 'Underground mining truck with 63-tonne payload capacity. Automated haulage system compatible.', 2100000.00, '2024-12-20', '2025-01-19', 30),
        ('Ball Mill', 'Blasthole drilling rig capable of drilling 251-311mm diameter holes up to 40m deep.', 3200000.00, '2024-12-05', '2025-02-03', 60)
    ]
    
    # Insert new equipment
    cursor.executemany('''
    INSERT INTO equipment (name, description, value_usd, last_service_date, next_service_date, service_interval_days)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', equipment_data)
    
    # Commit changes
    conn.commit()
    
    # Verify the update
    cursor.execute('''
    SELECT id, name, description, value_usd, last_service_date, next_service_date, service_interval_days
    FROM equipment
    ORDER BY name
    ''')
    
    print("\nUpdated Equipment List:")
    print("=" * 120)
    print(f"{'ID':<4} {'Name':<30} {'Description':<40} {'Value (USD)':<15} {'Last Service':<15} {'Next Service':<15} {'Interval'}")
    print("-" * 120)
    
    for row in cursor.fetchall():
        print(f"{row[0]:<4} {row[1]:<30} {row[2][:37]+'...':<40} ${row[3]:<14,.2f} {row[4]:<15} {row[5]:<15} {row[6]} days")
    
    conn.close()

if __name__ == '__main__':
    update_equipment()
