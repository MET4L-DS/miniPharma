import pymysql

HOST = "localhost"
PORT = 3306
USER = "root"
PASSWORD = "root"
DB_NAME = "DBMSProj"


def main():
    conn = pymysql.connect(host=HOST, user=USER, password=PASSWORD, port=PORT)
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )
        conn.commit()
        print(f"Database '{DB_NAME}' created or already exists.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
