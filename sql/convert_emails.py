import json

def escape_string(s):
    return s.replace('\\', '\\\\').replace('\'', '\\\'')

# Open the JSON file
with open('emails.json', 'r') as f:

    # Load the JSON data
    data = json.load(f)

    # Open the SQL file for writing
    with open('emails.sql', 'w') as sql_file:

        # Create the flint database and emails table
        sql_file.write('CREATE DATABASE IF NOT EXISTS flint;\n')
        sql_file.write('USE flint;\n')
        sql_file.write('DROP TABLE IF EXISTS emails;\n')
        sql_file.write('CREATE TABLE emails (\n')
        sql_file.write('id INT AUTO_INCREMENT PRIMARY KEY,\n')
        sql_file.write('sender TINYTEXT,\n')
        sql_file.write('email_to LONGTEXT,\n')
        sql_file.write('subject TEXT,\n')
        sql_file.write('attachments TINYTEXT,\n')
        sql_file.write('cc TEXT,\n')
        sql_file.write('timestamp INT,\n')
        sql_file.write('email_order TINYINT,\n')
        sql_file.write('full_email LONGTEXT,\n')
        sql_file.write('header TEXT,\n')
        sql_file.write('email_id TINYTEXT,\n')
        sql_file.write('pages LONGTEXT,\n')
        sql_file.write('bookmark TINYTEXT,\n')
        sql_file.write('pdf TINYTEXT,\n')
        sql_file.write('bm_title TINYTEXT,\n')
        sql_file.write('acode TINYINT,\n')
        sql_file.write('bcode TINYINT\n')
        sql_file.write(');\n')

        # Loop through each object in the JSON file
        for key in data:

            # Get the current object
            obj = data[key]

            # Convert the lists to strings
            if isinstance(obj['attachments'], list):
                attachments_str = escape_string(','.join(obj['attachments']))
            else:
                attachments_str = escape_string(obj['attachments'])
            
            to_str = escape_string(','.join(obj['email_to']))
            pages_str = escape_string(','.join(obj['pages']))
            cc_str = escape_string(','.join(obj['cc']))

            # Write the INSERT statement for this object
            sql_file.write(f"INSERT INTO emails (sender, email_to, subject, attachments, cc, timestamp, email_order, full_email, header, email_id, pages, bookmark, pdf, bm_title, acode, bcode) VALUES ('{escape_string(obj['sender'])}', '{to_str}', '{escape_string(obj['subject'])}', '{escape_string(attachments_str)}', '{cc_str}', {obj['timestamp']}, {obj['email_order']}, '{escape_string(obj['full_email'])}', '{escape_string(obj['header'])}', '{obj['email_id']}', '{pages_str}', '{obj['bookmark']}', '{obj['pdf']}', '{escape_string(obj['bm_title'])}', {obj['acode']}, {obj['bcode']});\n")
