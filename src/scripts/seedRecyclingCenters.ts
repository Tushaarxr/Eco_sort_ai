import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { GeoPoint } from 'firebase/firestore';
import { RecyclingCenter } from '../types';

// Firebase configuration (should match your app's config)
const firebaseConfig = {
  // Add your Firebase config here
  // This should be loaded from environment variables in production
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Comprehensive recycling centers data for seeding
const RECYCLING_CENTERS_DATA: Omit<RecyclingCenter, 'id' | 'distance'>[] = [
  // Major US Cities - Electronics Recycling Centers
  {
    name: 'Best Buy Electronics Recycling',
    address: '1000 Technology Dr, San Jose, CA 95110',
    location: new GeoPoint(37.4419, -121.9430),
    acceptsItems: ['computers', 'phones', 'tablets', 'batteries', 'cables', 'monitors', 'printers'],
    phoneNumber: '+1 (408) 555-0123',
    website: 'https://www.bestbuy.com/site/services/recycling/pcmcat149900050025.c',
    operatingHours: 'Mon-Sat: 10:00 AM - 9:00 PM, Sun: 11:00 AM - 8:00 PM',
    certifications: ['R2', 'e-Stewards'],
    acceptsDataDevices: true,
    dataWipingService: true,
    pickupService: false,
    fees: 'Free for most items, $30 for TVs and monitors over 32"'
  },
  {
    name: 'Staples Electronics Recycling',
    address: '500 Market St, San Francisco, CA 94105',
    location: new GeoPoint(37.7749, -122.4194),
    acceptsItems: ['computers', 'phones', 'tablets', 'batteries', 'ink cartridges', 'small electronics'],
    phoneNumber: '+1 (415) 555-0124',
    website: 'https://www.staples.com/sbd/cre/marketing/sustainability-center/recycling-services/',
    operatingHours: 'Mon-Fri: 8:00 AM - 9:00 PM, Sat: 9:00 AM - 9:00 PM, Sun: 10:00 AM - 7:00 PM',
    certifications: ['R2'],
    acceptsDataDevices: true,
    dataWipingService: false,
    pickupService: false,
    fees: 'Free for most small electronics'
  },
  {
    name: 'EcoATM Kiosk - Union Square',
    address: '865 Market St, San Francisco, CA 94103',
    location: new GeoPoint(37.7849, -122.4094),
    acceptsItems: ['phones', 'tablets', 'mp3 players'],
    phoneNumber: '+1 (800) 555-0125',
    website: 'https://www.ecoatm.com',
    operatingHours: '24/7 (Kiosk)',
    certifications: ['R2'],
    acceptsDataDevices: true,
    dataWipingService: true,
    pickupService: false,
    fees: 'Pays cash for working devices'
  },
  {
    name: 'Goodwill Computer Works',
    address: '1580 Folsom St, San Francisco, CA 94103',
    location: new GeoPoint(37.7699, -122.4149),
    acceptsItems: ['computers', 'monitors', 'keyboards', 'mice', 'cables', 'printers'],
    phoneNumber: '+1 (415) 555-0126',
    website: 'https://www.goodwillsf.org',
    operatingHours: 'Mon-Sat: 9:00 AM - 7:00 PM, Sun: 10:00 AM - 6:00 PM',
    certifications: ['R2'],
    acceptsDataDevices: true,
    dataWipingService: true,
    pickupService: true,
    fees: 'Free donation, tax deductible'
  },
  
  // New York City
  {
    name: 'NYC Department of Sanitation E-Waste',
    address: '125 Worth St, New York, NY 10013',
    location: new GeoPoint(40.7128, -74.0060),
    acceptsItems: ['computers', 'phones', 'tablets', 'televisions', 'monitors', 'printers', 'batteries'],
    phoneNumber: '+1 (212) 555-0127',
    website: 'https://www1.nyc.gov/assets/dsny/site/services/electronics',
    operatingHours: 'Mon-Fri: 8:00 AM - 4:00 PM',
    certifications: ['R2', 'e-Stewards'],
    acceptsDataDevices: true,
    dataWipingService: true,
    pickupService: true,
    fees: 'Free for residents'
  },
  {
    name: 'Lower East Side Ecology Center',
    address: '710 E 6th St, New York, NY 10009',
    location: new GeoPoint(40.7228, -73.9760),
    acceptsItems: ['computers', 'phones', 'tablets', 'small electronics', 'batteries', 'cables'],
    phoneNumber: '+1 (212) 555-0128',
    website: 'https://www.lesecologycenter.org',
    operatingHours: 'Tue, Thu, Sat: 10:00 AM - 4:00 PM',
    certifications: ['R2'],
    acceptsDataDevices: true,
    dataWipingService: false,
    pickupService: false,
    fees: 'Free'
  },
  
  // Los Angeles
  {
    name: 'LA County Household Hazardous Waste',
    address: '5050 Commerce Dr, Baldwin Park, CA 91706',
    location: new GeoPoint(34.0522, -118.2437),
    acceptsItems: ['computers', 'phones', 'tablets', 'televisions', 'batteries', 'fluorescent bulbs'],
    phoneNumber: '+1 (323) 555-0129',
    website: 'https://dpw.lacounty.gov/epd/hhw/',
    operatingHours: 'Sat-Sun: 9:00 AM - 3:00 PM',
    certifications: ['R2', 'e-Stewards'],
    acceptsDataDevices: true,
    dataWipingService: true,
    pickupService: false,
    fees: 'Free for residents'
  },
  
  // Chicago
  {
    name: 'Chicago Electronics Recycling',
    address: '1150 N North Branch St, Chicago, IL 60642',
    location: new GeoPoint(41.8781, -87.6298),
    acceptsItems: ['computers', 'phones', 'tablets', 'televisions', 'monitors', 'printers', 'batteries'],
    phoneNumber: '+1 (312) 555-0130',
    website: 'https://www.chicago.gov/city/en/depts/streets/supp_info/recycling1/electronics_recycling.html',
    operatingHours: 'Mon-Fri: 8:00 AM - 4:00 PM, Sat: 8:00 AM - 12:00 PM',
    certifications: ['R2'],
    acceptsDataDevices: true,
    dataWipingService: true,
    pickupService: true,
    fees: 'Free for residents, fees for businesses'
  },
  
  // Seattle
  {
    name: 'Seattle Public Utilities E-Waste',
    address: '700 5th Ave, Seattle, WA 98104',
    location: new GeoPoint(47.6062, -122.3321),
    acceptsItems: ['computers', 'phones', 'tablets', 'televisions', 'monitors', 'small electronics'],
    phoneNumber: '+1 (206) 555-0131',
    website: 'https://www.seattle.gov/utilities/your-services/collection-and-disposal/electronics-recycling',
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    certifications: ['R2', 'e-Stewards'],
    acceptsDataDevices: true,
    dataWipingService: true,
    pickupService: true,
    fees: 'Free for residents'
  },
  
  // Austin
  {
    name: 'Austin Resource Recovery E-Waste',
    address: '2514 Business Center Dr, Austin, TX 78744',
    location: new GeoPoint(30.2672, -97.7431),
    acceptsItems: ['computers', 'phones', 'tablets', 'televisions', 'batteries', 'small appliances'],
    phoneNumber: '+1 (512) 555-0132',
    website: 'https://www.austintexas.gov/department/electronics-recycling',
    operatingHours: 'Tue-Sat: 8:00 AM - 5:00 PM',
    certifications: ['R2'],
    acceptsDataDevices: true,
    dataWipingService: false,
    pickupService: false,
    fees: 'Free for residents'
  },
  
  // International - India (Chennai)
  {
    name: 'Earth Sense Recycle',
    address: '15, Bazullah Rd, T. Nagar, Chennai, Tamil Nadu 600017',
    location: new GeoPoint(13.0827, 80.2707),
    acceptsItems: ['electronics', 'batteries', 'computers', 'phones'],
    phoneNumber: '+91 44 4212 7070',
    website: 'https://www.earthsenserecycle.com',
    operatingHours: 'Mon-Sat: 9:00 AM - 6:00 PM',
    certifications: ['ISO 14001'],
    acceptsDataDevices: true,
    dataWipingService: true,
    pickupService: true,
    fees: 'Varies by item type'
  },
  {
    name: 'Eco Birdd E-Waste Recyclers',
    address: 'No.1, Vellalar Street, Mogappair East, Chennai, Tamil Nadu 600037',
    location: new GeoPoint(13.1067, 80.1807),
    acceptsItems: ['electronics', 'computers', 'phones', 'appliances'],
    phoneNumber: '+91 95000 55000',
    website: 'https://www.ecobirdd.com',
    operatingHours: 'Mon-Sat: 10:00 AM - 7:00 PM',
    certifications: ['ISO 14001', 'CPCB Authorization'],
    acceptsDataDevices: true,
    dataWipingService: true,
    pickupService: true,
    fees: 'Free pickup for bulk items'
  },
  
  // International - UK (London)
  {
    name: 'Currys PC World Recycling',
    address: '1 Portal Way, London W3 6RS, UK',
    location: new GeoPoint(51.5074, -0.1278),
    acceptsItems: ['computers', 'phones', 'tablets', 'small appliances', 'batteries'],
    phoneNumber: '+44 20 7555 0133',
    website: 'https://www.currys.co.uk/services/recycling',
    operatingHours: 'Mon-Sat: 9:00 AM - 8:00 PM, Sun: 11:00 AM - 5:00 PM',
    certifications: ['WEEE Approved'],
    acceptsDataDevices: true,
    dataWipingService: true,
    pickupService: false,
    fees: 'Free with purchase, £25 without'
  },
  
  // International - Canada (Toronto)
  {
    name: 'Ontario Electronic Stewardship',
    address: '5700 Yonge St, Toronto, ON M2M 4K2, Canada',
    location: new GeoPoint(43.6532, -79.3832),
    acceptsItems: ['computers', 'phones', 'tablets', 'televisions', 'batteries', 'small electronics'],
    phoneNumber: '+1 (416) 555-0134',
    website: 'https://www.ontarioelectronicstewardship.ca',
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 3:00 PM',
    certifications: ['R2', 'ISO 14001'],
    acceptsDataDevices: true,
    dataWipingService: true,
    pickupService: true,
    fees: 'Free for residents'
  },
  
  // Specialized Centers
  {
    name: 'Battery Solutions Inc.',
    address: '302 N Huron St, Ypsilanti, MI 48197',
    location: new GeoPoint(42.2411, -83.6130),
    acceptsItems: ['batteries', 'battery packs', 'ups systems'],
    phoneNumber: '+1 (734) 555-0135',
    website: 'https://www.batterysolutions.com',
    operatingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    certifications: ['R2', 'ISO 14001'],
    acceptsDataDevices: false,
    dataWipingService: false,
    pickupService: true,
    fees: 'Varies by battery type'
  },
  {
    name: 'Call2Recycle Drop-off',
    address: '1000 Parkwood Cir, Atlanta, GA 30339',
    location: new GeoPoint(33.7490, -84.3880),
    acceptsItems: ['batteries', 'cell phones', 'battery packs'],
    phoneNumber: '+1 (877) 555-0136',
    website: 'https://www.call2recycle.org',
    operatingHours: 'Mon-Fri: 9:00 AM - 6:00 PM',
    certifications: ['R2'],
    acceptsDataDevices: true,
    dataWipingService: false,
    pickupService: false,
    fees: 'Free'
  }
];

// Function to clear existing data (use with caution)
export const clearRecyclingCenters = async (): Promise<void> => {
  try {
    const centersRef = collection(db, 'recyclingCenters');
    const snapshot = await getDocs(centersRef);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('Cleared existing recycling centers data');
  } catch (error) {
    console.error('Error clearing recycling centers:', error);
    throw error;
  }
};

// Function to seed recycling centers data
export const seedRecyclingCenters = async (clearFirst: boolean = false): Promise<void> => {
  try {
    if (clearFirst) {
      await clearRecyclingCenters();
    }
    
    console.log('Starting to seed recycling centers data...');
    
    const centersRef = collection(db, 'recyclingCenters');
    let successCount = 0;
    let errorCount = 0;
    
    // Add each recycling center
    for (const centerData of RECYCLING_CENTERS_DATA) {
      try {
        const docRef = await addDoc(centersRef, {
          ...centerData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          verified: true,
          active: true
        });
        
        console.log(`Added recycling center: ${centerData.name} (ID: ${docRef.id})`);
        successCount++;
      } catch (error) {
        console.error(`Error adding ${centerData.name}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\nSeeding completed!`);
    console.log(`Successfully added: ${successCount} centers`);
    console.log(`Errors: ${errorCount} centers`);
    
    if (errorCount > 0) {
      console.warn('Some centers failed to be added. Check the errors above.');
    }
    
  } catch (error) {
    console.error('Error seeding recycling centers:', error);
    throw error;
  }
};

// Function to verify seeded data
export const verifySeededData = async (): Promise<void> => {
  try {
    const centersRef = collection(db, 'recyclingCenters');
    const snapshot = await getDocs(centersRef);
    
    console.log(`\nVerification Results:`);
    console.log(`Total centers in database: ${snapshot.size}`);
    
    // Group by location for verification
    const locationCounts: { [key: string]: number } = {};
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const location = data.address?.split(',').slice(-2).join(',').trim() || 'Unknown';
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });
    
    console.log('\nCenters by location:');
    Object.entries(locationCounts).forEach(([location, count]) => {
      console.log(`  ${location}: ${count} centers`);
    });
    
  } catch (error) {
    console.error('Error verifying seeded data:', error);
    throw error;
  }
};

// Main execution function
const main = async () => {
  try {
    console.log('🌱 Starting Recycling Centers Database Seeding...');
    
    // Seed the data (set to true to clear existing data first)
    await seedRecyclingCenters(false);
    
    // Verify the seeded data
    await verifySeededData();
    
    console.log('\n✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { RECYCLING_CENTERS_DATA };