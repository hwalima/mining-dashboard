import sqlite3

def show_equipment():
    conn = sqlite3.connect('mymine.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT id, name, description, value_usd, last_service_date, next_service_date, service_interval_days
    FROM equipment
    ''')
    
    print("\nEquipment List:")
    print("=" * 100)
    print(f"{'ID':<4} {'Name':<20} {'Description':<30} {'Value (USD)':<15} {'Last Service':<15} {'Next Service':<15} {'Interval'}")
    print("-" * 100)
    
    for row in cursor.fetchall():
        print(f"{row[0]:<4} {row[1]:<20} {row[2]:<30} ${row[3]:<14,.2f} {row[4]:<15} {row[5]:<15} {row[6]} days")
    
    print("\nSample Running Times:")
    print("=" * 100)
    cursor.execute('''
    SELECT e.name, ert.date, ert.total_running_hours, ert.remarks
    FROM equipment_running_time ert
    JOIN equipment e ON e.id = ert.equipment_id
    ORDER BY ert.date DESC
    LIMIT 5
    ''')
    
    print(f"{'Equipment':<20} {'Date':<12} {'Hours':<8} {'Remarks'}")
    print("-" * 100)
    for row in cursor.fetchall():
        print(f"{row[0]:<20} {row[1]:<12} {row[2]:<8.2f} {row[3]}")
    
    conn.close()

if __name__ == '__main__':
    show_equipment()
