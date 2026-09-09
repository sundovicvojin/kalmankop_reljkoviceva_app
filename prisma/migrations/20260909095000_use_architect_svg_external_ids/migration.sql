UPDATE "Apartment"
SET "externalId" = CASE "externalId"
  WHEN 'APT_01' THEN 'APT_S1'
  WHEN 'APT_02' THEN 'APT_S2'
  WHEN 'APT_03' THEN 'APT_S3'
  WHEN 'APT_04' THEN 'APT_S4'
  WHEN 'APT_05' THEN 'APT_S5'
  WHEN 'APT_06' THEN 'APT_S6'
  WHEN 'APT_07' THEN 'APT_S7'
  WHEN 'APT_08' THEN 'APT_S8'
  ELSE "externalId"
END
WHERE "externalId" IN (
  'APT_01',
  'APT_02',
  'APT_03',
  'APT_04',
  'APT_05',
  'APT_06',
  'APT_07',
  'APT_08'
);
