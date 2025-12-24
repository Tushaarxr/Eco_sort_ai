-- ============================================
-- SEED DATA FOR E-WASTE ASSISTANT APP
-- Run this in Supabase SQL Editor
-- ============================================

-- ===========================================
-- 1. CREATE EWASTE_ITEMS TABLE (Repository)
-- ===========================================
CREATE TABLE IF NOT EXISTS ewaste_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  category_id TEXT,
  keywords TEXT[] DEFAULT '{}',
  materials TEXT[] DEFAULT '{}',
  hazard_level TEXT DEFAULT 'medium',
  disposal_instructions TEXT[] DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ewaste_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Allow public read ewaste_items" ON ewaste_items;

-- Allow public read access
CREATE POLICY "Allow public read ewaste_items"
  ON ewaste_items FOR SELECT TO public USING (true);

-- Clear existing data to avoid duplicates
DELETE FROM ewaste_items;

-- ===========================================
-- 2. SEED EWASTE_ITEMS DATA (25+ items)
-- ===========================================

INSERT INTO ewaste_items (name, description, category, category_id, keywords, materials, hazard_level, disposal_instructions, image_url) VALUES

-- SMARTPHONES
('iPhone', 'Apple smartphone with lithium battery and glass screen.', 'Smartphones', 'smartphones', 
 ARRAY['iphone', 'apple', 'smartphone', 'mobile', 'cell phone'],
 ARRAY['Glass', 'Aluminum', 'Lithium Battery', 'Circuit Board', 'Rare Earth Metals'],
 'medium',
 ARRAY['Back up your data and perform a factory reset', 'Remove SIM card and any memory cards', 'Take to an Apple Store for trade-in or recycling', 'Many retailers offer trade-in programs for credit'],
 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400'),

('Samsung Galaxy', 'Android smartphone with AMOLED display and lithium battery.', 'Smartphones', 'smartphones',
 ARRAY['samsung', 'galaxy', 'android', 'smartphone', 'mobile'],
 ARRAY['Glass', 'Plastic', 'Lithium Battery', 'Circuit Board', 'Copper'],
 'medium',
 ARRAY['Factory reset to wipe all personal data', 'Remove SIM and SD cards', 'Check Samsung trade-in program', 'Take to certified e-waste recycler'],
 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'),

-- COMPUTERS
('Laptop Computer', 'Portable computer with screen, keyboard, and battery.', 'Computers', 'computers',
 ARRAY['laptop', 'notebook', 'computer', 'pc', 'macbook'],
 ARRAY['Plastic', 'Aluminum', 'Lithium Battery', 'Circuit Board', 'LCD Screen', 'Copper', 'Gold'],
 'medium',
 ARRAY['Securely wipe the hard drive or remove it', 'Remove battery if detachable', 'Check manufacturer take-back program', 'Take to electronics recycling center'],
 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),

('Desktop Computer', 'Tower computer with separate monitor, keyboard and mouse.', 'Computers', 'computers',
 ARRAY['desktop', 'tower', 'pc', 'computer', 'cpu'],
 ARRAY['Steel', 'Plastic', 'Circuit Board', 'Copper', 'Aluminum', 'Gold', 'Silver'],
 'medium',
 ARRAY['Remove and destroy hard drive for data security', 'Separate components if possible', 'Take tower to e-waste recycler', 'Some parts may be reusable'],
 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400'),

('Computer Monitor', 'LCD or LED display screen for computers.', 'Computers', 'computers',
 ARRAY['monitor', 'screen', 'display', 'lcd', 'led'],
 ARRAY['Plastic', 'Glass', 'LED/LCD Panel', 'Circuit Board', 'Mercury (older models)'],
 'medium',
 ARRAY['Handle with care - screens can break', 'Older CRT monitors contain lead and must go to hazardous waste', 'LCD monitors can go to regular e-waste recyclers', 'Never throw in regular trash'],
 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'),

-- BATTERIES
('Lithium-Ion Battery', 'Rechargeable battery used in phones, laptops, and EVs.', 'Batteries', 'batteries',
 ARRAY['battery', 'lithium', 'li-ion', 'rechargeable', 'power'],
 ARRAY['Lithium', 'Cobalt', 'Nickel', 'Manganese', 'Plastic'],
 'high',
 ARRAY['NEVER dispose in regular trash - fire hazard', 'Cover terminals with tape to prevent short circuits', 'Take to battery recycling drop-off', 'Many electronics stores accept batteries', 'Keep away from heat and water'],
 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=400'),

('Alkaline Battery', 'Single-use household batteries (AA, AAA, C, D, 9V).', 'Batteries', 'batteries',
 ARRAY['battery', 'alkaline', 'aa', 'aaa', 'duracell', 'energizer'],
 ARRAY['Zinc', 'Manganese Dioxide', 'Steel', 'Potassium Hydroxide'],
 'low',
 ARRAY['Can be disposed in regular trash in most areas', 'Recycling is still recommended', 'Many stores have battery drop-off bins', 'Do not burn or puncture'],
 'https://images.unsplash.com/photo-1619641805634-e1af86fd2d94?w=400'),

('Car Battery', 'Lead-acid battery used in automobiles.', 'Batteries', 'batteries',
 ARRAY['car battery', 'lead acid', 'automotive', 'vehicle battery'],
 ARRAY['Lead', 'Sulfuric Acid', 'Plastic', 'Copper'],
 'high',
 ARRAY['HAZARDOUS - handle with extreme care', 'Never tip over - contains acid', 'Auto parts stores typically accept for free', 'Many offer core credit toward new battery', 'Illegal to dispose in trash'],
 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=400'),

-- APPLIANCES
('Refrigerator', 'Large cooling appliance for food storage.', 'Appliances', 'appliances',
 ARRAY['refrigerator', 'fridge', 'freezer', 'cooling'],
 ARRAY['Steel', 'Plastic', 'Refrigerant (CFC/HFC)', 'Copper', 'Insulation Foam'],
 'high',
 ARRAY['Contains refrigerants that damage ozone - requires certified handling', 'Schedule bulk pickup with local waste management', 'Many retailers offer haul-away with new purchase', 'Never abandon outdoors'],
 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400'),

('Washing Machine', 'Appliance for cleaning clothes.', 'Appliances', 'appliances',
 ARRAY['washing machine', 'washer', 'laundry'],
 ARRAY['Steel', 'Plastic', 'Copper Motor', 'Rubber', 'Circuit Board'],
 'low',
 ARRAY['Disconnect water lines and power', 'Some scrap metal collectors will pick up for free', 'Schedule bulk pickup', 'Retailers often haul away old unit'],
 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400'),

('Microwave Oven', 'Countertop appliance for heating food using microwaves.', 'Appliances', 'appliances',
 ARRAY['microwave', 'oven', 'kitchen'],
 ARRAY['Steel', 'Plastic', 'Magnetron', 'Copper', 'Capacitor'],
 'medium',
 ARRAY['Contains high-voltage capacitor - do not open', 'Take to e-waste recycler', 'Some municipalities accept with regular e-waste', 'Never throw in regular trash'],
 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400'),

('Air Conditioner', 'Cooling unit for homes and offices.', 'Appliances', 'appliances',
 ARRAY['air conditioner', 'ac', 'hvac', 'cooling'],
 ARRAY['Steel', 'Copper', 'Aluminum', 'Refrigerant', 'Compressor'],
 'high',
 ARRAY['Contains refrigerants requiring certified disposal', 'Contact HVAC professional for removal', 'Never vent refrigerants to atmosphere', 'Schedule with hazardous waste pickup'],
 'https://images.unsplash.com/photo-1625961332771-3f40b0e2bdcf?w=400'),

-- TVs & AUDIO
('LED/LCD Television', 'Flat-screen TV with LED or LCD display.', 'TVs & Audio', 'tvs_audio',
 ARRAY['tv', 'television', 'lcd', 'led', 'flat screen', 'smart tv'],
 ARRAY['Plastic', 'Glass', 'LED Panel', 'Circuit Board', 'Copper'],
 'medium',
 ARRAY['Handle carefully - screen can crack', 'Take to electronics recycling center', 'Some retailers accept for recycling', 'Remove batteries from remote control'],
 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400'),

('CRT Television', 'Old tube-style television (pre-flat screen).', 'TVs & Audio', 'tvs_audio',
 ARRAY['crt', 'tube tv', 'old tv', 'cathode ray'],
 ARRAY['Glass', 'Lead', 'Phosphors', 'Plastic', 'Copper'],
 'high',
 ARRAY['Contains up to 5 lbs of lead - HAZARDOUS', 'Must go to certified e-waste handler', 'Never break the tube', 'Check local hazardous waste collection events'],
 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),

('Speakers', 'Audio output devices including portable and home speakers.', 'TVs & Audio', 'tvs_audio',
 ARRAY['speaker', 'audio', 'bluetooth speaker', 'sound'],
 ARRAY['Plastic', 'Magnets', 'Copper Wire', 'Paper/Fabric Cone', 'Battery (portable)'],
 'low',
 ARRAY['Remove batteries if present', 'Take to electronics recycler', 'Working speakers can be donated', 'Small speakers may be accepted in small electronics bins'],
 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400'),

('Headphones', 'Personal audio devices worn on or in ears.', 'TVs & Audio', 'tvs_audio',
 ARRAY['headphones', 'earbuds', 'earphones', 'airpods'],
 ARRAY['Plastic', 'Copper', 'Magnets', 'Lithium Battery (wireless)', 'Rubber'],
 'low',
 ARRAY['Remove any batteries if possible', 'Take to electronics recycler', 'Some manufacturers have take-back programs', 'Do not throw in regular trash'],
 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),

-- CABLES & CHARGERS
('USB Cables', 'Cables for data transfer and charging devices.', 'Cables & Chargers', 'cables',
 ARRAY['usb', 'cable', 'charger', 'wire', 'lightning', 'type-c'],
 ARRAY['Copper', 'Plastic', 'Gold Plating', 'Rubber'],
 'low',
 ARRAY['Do not throw in regular trash', 'Many office stores accept cables', 'Bundle with other e-waste for recycling', 'Consider donating working cables'],
 'https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?w=400'),

('Power Adapter/Charger', 'Wall chargers and power bricks for electronics.', 'Cables & Chargers', 'cables',
 ARRAY['charger', 'adapter', 'power supply', 'wall charger', 'brick'],
 ARRAY['Plastic', 'Copper', 'Transformer', 'Circuit Board'],
 'low',
 ARRAY['Recycle with other small electronics', 'Many stores accept chargers', 'Do not throw in trash', 'Universal chargers can often be donated'],
 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400'),

-- PRINTERS
('Inkjet Printer', 'Home and office printer using liquid ink.', 'Printers', 'printers',
 ARRAY['printer', 'inkjet', 'hp', 'canon', 'epson'],
 ARRAY['Plastic', 'Circuit Board', 'Ink Cartridges', 'Motors', 'Glass Scanner'],
 'medium',
 ARRAY['Remove ink cartridges - recycle separately', 'Many office stores accept cartridges', 'Take printer body to e-waste recycler', 'Check manufacturer trade-in programs'],
 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400'),

('Laser Printer', 'Office printer using toner powder.', 'Printers', 'printers',
 ARRAY['printer', 'laser', 'toner', 'office printer'],
 ARRAY['Plastic', 'Steel', 'Toner Cartridge', 'Fuser Unit', 'Circuit Board'],
 'medium',
 ARRAY['Remove toner cartridge carefully - powder can be harmful', 'Toner cartridges can be returned to manufacturer', 'Take to commercial e-waste recycler', 'Laser printers are often accepted by office stores'],
 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400'),

-- GAMING
('Game Console', 'Gaming systems like PlayStation, Xbox, Nintendo.', 'Gaming', 'gaming',
 ARRAY['playstation', 'xbox', 'nintendo', 'switch', 'console', 'gaming'],
 ARRAY['Plastic', 'Circuit Board', 'Copper', 'Hard Drive', 'Power Supply'],
 'medium',
 ARRAY['Factory reset to remove personal data', 'Consider selling or donating if working', 'Take to electronics recycler', 'Remove any discs'],
 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400'),

('Game Controllers', 'Wireless and wired game controllers.', 'Gaming', 'gaming',
 ARRAY['controller', 'gamepad', 'joystick', 'remote'],
 ARRAY['Plastic', 'Circuit Board', 'Lithium Battery', 'Rubber'],
 'low',
 ARRAY['Remove batteries if possible', 'Recycle with small electronics', 'Working controllers can be donated', 'Check gaming store trade-in programs'],
 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=400'),

-- CAMERAS & DRONES
('Digital Camera', 'Point-and-shoot or DSLR camera.', 'Cameras', 'cameras',
 ARRAY['camera', 'digital camera', 'dslr', 'mirrorless', 'photography'],
 ARRAY['Plastic', 'Metal', 'Glass Lens', 'Circuit Board', 'Li-ion Battery'],
 'medium',
 ARRAY['Remove memory card and battery', 'Consider selling if functional', 'Take to electronics recycler', 'Some camera stores have trade-in programs'],
 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400'),

('Drone', 'Remote-controlled flying device with camera.', 'Cameras', 'cameras',
 ARRAY['drone', 'quadcopter', 'uav', 'dji'],
 ARRAY['Plastic', 'Carbon Fiber', 'Lithium Battery', 'Motors', 'Circuit Board'],
 'medium',
 ARRAY['Remove and recycle batteries separately', 'Contains valuable motors and electronics', 'Take to specialized electronics recycler', 'Check manufacturer recycling program'],
 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400'),

-- WEARABLES
('Smartwatch', 'Wearable computing device worn on wrist.', 'Wearables', 'wearables',
 ARRAY['smartwatch', 'apple watch', 'fitbit', 'wearable'],
 ARRAY['Aluminum/Steel', 'Glass', 'Lithium Battery', 'Circuit Board', 'Rubber Band'],
 'medium',
 ARRAY['Factory reset to remove personal data', 'Remove band for separate recycling', 'Check brand trade-in programs', 'Take to electronics recycler'],
 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400'),

('Fitness Tracker', 'Wearable activity and health monitoring device.', 'Wearables', 'wearables',
 ARRAY['fitness tracker', 'fitbit', 'activity tracker', 'health band'],
 ARRAY['Plastic', 'Lithium Battery', 'Circuit Board', 'Silicone'],
 'low',
 ARRAY['Remove personal data if possible', 'Recycle with small electronics', 'Some brands have take-back programs', 'Do not throw in regular trash'],
 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400');

-- ===========================================
-- 3. RECYCLING CENTERS - Using JSONB format
-- ===========================================

-- Drop and recreate table to ensure correct types
DROP TABLE IF EXISTS recycling_centers CASCADE;

CREATE TABLE recycling_centers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone_number TEXT,
  website TEXT,
  operating_hours TEXT,
  accepts_items JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  accepts_data_devices BOOLEAN DEFAULT false,
  data_wiping_service BOOLEAN DEFAULT false,
  pickup_service BOOLEAN DEFAULT false,
  fees TEXT,
  active BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE recycling_centers ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read recycling_centers"
  ON recycling_centers FOR SELECT TO public USING (true);

-- Insert recycling centers with proper JSONB arrays
INSERT INTO recycling_centers (name, address, latitude, longitude, phone_number, website, operating_hours, accepts_items, certifications, accepts_data_devices, data_wiping_service, pickup_service, fees, active, verified) VALUES

('GreenTech E-Waste Solutions', '123 Tech Park, Bangalore, Karnataka', 12.9716, 77.5946, '+91-80-4567-8900', 'https://greentechewaste.in', 'Mon-Sat: 9AM-6PM', 
 '["Electronics", "Batteries", "Computers", "Phones", "Appliances", "Cables"]'::jsonb,
 '["ISO 14001", "R2 Certified"]'::jsonb, true, true, true, 'Free for most items', true, true),

('EcoRecycle Mumbai', '456 Industrial Area, Andheri East, Mumbai', 19.1136, 72.8697, '+91-22-2345-6789', 'https://ecorecyclemumbai.com', 'Mon-Fri: 10AM-7PM, Sat: 10AM-4PM',
 '["Electronics", "Batteries", "Computers", "Phones", "TVs"]'::jsonb,
 '["ISO 14001"]'::jsonb, true, true, false, 'Small fee for large appliances', true, true),

('Delhi E-Waste Center', '789 Okhla Phase 2, New Delhi', 28.5355, 77.2673, '+91-11-4567-8901', 'https://delhiewaste.org', 'Mon-Sat: 9AM-5PM',
 '["Electronics", "Batteries", "Computers", "Phones", "Printers"]'::jsonb,
 '["CPCB Authorized"]'::jsonb, true, false, true, 'Free pickup for bulk', true, true),

('Chennai Recycle Hub', '321 Guindy Industrial Estate, Chennai', 13.0067, 80.2206, '+91-44-2345-6789', 'https://chennairecyclehub.in', 'Mon-Sat: 9:30AM-6PM',
 '["Electronics", "Batteries", "Computers", "Appliances"]'::jsonb,
 '["ISO 14001", "TNPCB Certified"]'::jsonb, true, true, false, 'Free', true, true),

('Hyderabad E-Cycle', '567 HITEC City, Hyderabad', 17.4435, 78.3772, '+91-40-5678-9012', 'https://hyderabadecycle.com', 'Mon-Sat: 10AM-6PM',
 '["Electronics", "Batteries", "Computers", "Phones", "Gaming"]'::jsonb,
 '["ISO 14001"]'::jsonb, true, true, true, 'Free for personal e-waste', true, true),

('Kolkata Green Electronics', '890 Salt Lake Sector V, Kolkata', 22.5726, 88.4353, '+91-33-3456-7890', 'https://kolkatagreen.in', 'Mon-Fri: 10AM-5PM',
 '["Electronics", "Computers", "Phones", "Cables"]'::jsonb,
 '["WBPCB Authorized"]'::jsonb, false, false, false, 'Free', true, true),

('Pune E-Waste Solutions', '234 Hinjewadi IT Park, Pune', 18.5912, 73.7389, '+91-20-6789-0123', 'https://puneewaste.com', 'Mon-Sat: 9AM-6PM',
 '["Electronics", "Batteries", "Computers", "Phones", "Appliances"]'::jsonb,
 '["ISO 14001", "R2 Certified"]'::jsonb, true, true, true, 'Free pickup above 10kg', true, true),

('Ahmedabad Recycle Center', '456 SG Highway, Ahmedabad', 23.0225, 72.5714, '+91-79-2345-6789', 'https://aaborecycle.in', 'Mon-Sat: 10AM-5PM',
 '["Electronics", "Batteries", "Computers", "TVs"]'::jsonb,
 '["GPCB Certified"]'::jsonb, true, false, false, 'Free', true, true),

('Jaipur E-Waste Hub', '789 Sitapura Industrial Area, Jaipur', 26.9124, 75.7873, '+91-141-456-7890', 'https://jaipurewaste.com', 'Mon-Sat: 9AM-5PM',
 '["Electronics", "Batteries", "Computers", "Phones"]'::jsonb,
 '["RSPCB Authorized"]'::jsonb, false, false, true, 'Nominal charges for pickup', true, true),

('Kochi Electronics Recyclers', '123 Cochin SEZ, Kochi', 9.9312, 76.2673, '+91-484-567-8901', 'https://kochirecycle.in', 'Mon-Fri: 9:30AM-5:30PM',
 '["Electronics", "Batteries", "Computers", "Phones", "Cables", "Appliances"]'::jsonb,
 '["ISO 14001", "KSPCB Certified"]'::jsonb, true, true, false, 'Free', true, true),

('Chandigarh E-Cycle', '345 Industrial Area Phase 1, Chandigarh', 30.7046, 76.8012, '+91-172-456-7890', 'https://chandigarhrecycle.in', 'Mon-Sat: 10AM-5PM',
 '["Electronics", "Batteries", "Computers"]'::jsonb,
 '["PPCB Authorized"]'::jsonb, false, false, false, 'Free', true, true),

('Lucknow Green Tech', '567 Gomti Nagar, Lucknow', 26.8467, 80.9462, '+91-522-345-6789', NULL, 'Mon-Sat: 10AM-4PM',
 '["Electronics", "Computers", "Phones"]'::jsonb,
 '["UPPCB Certified"]'::jsonb, false, false, false, 'Free', true, true);

-- ===========================================
-- 4. VERIFY DATA
-- ===========================================
SELECT 'E-Waste Items Count:', COUNT(*) FROM ewaste_items;
SELECT 'Recycling Centers Count:', COUNT(*) FROM recycling_centers WHERE active = true;
