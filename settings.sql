USE encubadora_db;
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY,
    temp_min DECIMAL(5,2),
    temp_max DECIMAL(5,2),
    hum_min DECIMAL(5,2),
    hum_max DECIMAL(5,2)
);
INSERT IGNORE INTO settings (id, temp_min, temp_max, hum_min, hum_max) VALUES (1, 37.5, 37.9, 50.0, 70.0);
