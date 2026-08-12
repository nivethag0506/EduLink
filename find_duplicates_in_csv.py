import csv

def find_duplicates_and_empty(csv_file, key_column):
    duplicates = set()
    seen = set()
    empty_rows = []
    duplicate_rows = []

    with open(csv_file, 'r', encoding='ISO-8859-1') as file:
        reader = csv.DictReader(file)
        for row_number, row in enumerate(reader, start=2):  # Start from 2 to account for the header
            key = row[key_column].strip().lower() if row[key_column] else None

            if not key:
                empty_rows.append(row_number)
            elif key in seen:
                duplicates.add(key)
                duplicate_rows.append(row_number)
            else:
                seen.add(key)

    return duplicates, empty_rows, duplicate_rows

# Replace with your CSV file path and the column name for the primary key (e.g., 'email')
csv_file_path = r"C:\Users\Shubham\Downloads\database.csv"
key_column_name = 'email'

duplicates, empty_rows, duplicate_rows = find_duplicates_and_empty(csv_file_path, key_column_name)

print(f"Duplicate emails found: {duplicates}")
print(f"Rows with empty emails: {empty_rows}")
print(f"Rows with duplicate emails: {duplicate_rows}")
