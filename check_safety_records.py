import sqlite3
import os

def check_safety_records():
    try:
        # Connect to the SQLite database
        db_path = os.path.join('mymine', 'db.sqlite3')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get table info
        cursor.execute("PRAGMA table_info(mining_operations_safetyincident)")
        columns = cursor.fetchall()
        print("\nTable structure:")
        for col in columns:
            print(f"{col[1]} ({col[2]})")
            
        # Get total count
        cursor.execute("SELECT COUNT(*) FROM mining_operations_safetyincident")
        total_count = cursor.fetchone()[0]
        print(f"\nTotal safety incidents: {total_count}")
        
        # Get recent records
        cursor.execute("""
            SELECT id, date, incident_type, severity, description, department_id 
            FROM mining_operations_safetyincident
            ORDER BY date DESC
            LIMIT 5
        """)
        records = cursor.fetchall()
        
        print("\nMost recent 5 safety incidents:")
        print("ID | Date | Type | Severity | Department ID | Description")
        print("-" * 80)
        for record in records:
            desc = record[4][:50] + "..." if len(record[4]) > 50 else record[4]
            print(f"{record[0]} | {record[1]} | {record[2]} | {record[3]} | {record[5]} | {desc}")
            
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    check_safety_records()
