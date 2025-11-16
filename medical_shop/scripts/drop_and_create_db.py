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
            # Drop database if exists
            cur.execute(f"DROP DATABASE IF EXISTS `{DB_NAME}`;")
            print(f"Database '{DB_NAME}' dropped (if it existed).")

            # Create fresh database
            cur.execute(
                f"CREATE DATABASE `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )
            print(f"Database '{DB_NAME}' created fresh.")
        conn.commit()
    finally:
        conn.close()


if __name__ == "__main__":
    main()
