import pymysql

conn = pymysql.connect(
    host='localhost',
    user='root',
    password='Ayush@2611',
    database='dbmsproj'
)

cursor = conn.cursor()
cursor.execute('DESCRIBE api_product')

print('Current api_product columns:')
for row in cursor.fetchall():
    print(f'  {row[0]}: {row[1]}')

conn.close()
