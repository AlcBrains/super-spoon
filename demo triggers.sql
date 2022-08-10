CREATE TRIGGER limit_shooters 
BEFORE INSERT ON shooters for each row
BEGIN
    SELECT CASE WHEN (SELECT COUNT (*) FROM shooters) >= 3
        THEN 
        RAISE(FAIL, "")
END;
END;


CREATE TRIGGER limit_shooting_records
BEFORE INSERT ON shootingRecords for each row
BEGIN
    SELECT CASE WHEN (SELECT COUNT (*) FROM shootingRecords) >= 3
        THEN 
        RAISE(FAIL, "")
END;
END;



CREATE TRIGGER limit_vaultRecords
BEFORE INSERT ON vaultRecords for each row
BEGIN
    SELECT CASE WHEN (SELECT COUNT (*) FROM vaultRecords) >= 3
        THEN 
        RAISE(FAIL, "")
END;
END;

