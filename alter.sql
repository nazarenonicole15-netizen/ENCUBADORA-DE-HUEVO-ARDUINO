USE encubadora_db;
ALTER TABLE settings ADD COLUMN start_date DATETIME;
ALTER TABLE settings ADD COLUMN bird_type VARCHAR(50) DEFAULT 'gallina';
