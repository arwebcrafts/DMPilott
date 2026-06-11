-- Add video block type to bio_blocks

ALTER TABLE bio_blocks DROP CONSTRAINT IF EXISTS bio_blocks_type_check;
ALTER TABLE bio_blocks ADD CONSTRAINT bio_blocks_type_check
  CHECK (type IN ('link', 'header', 'email_capture', 'product', 'video'));
