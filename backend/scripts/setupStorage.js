import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket(name, isPublic = true) {
  console.log(`Creating bucket: ${name}...`);
  
  const { data, error } = await supabase.storage.createBucket(name, {
    public: isPublic,
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log(`  ✓ Bucket "${name}" already exists`);
      return true;
    }
    console.error(`  ✗ Failed to create bucket "${name}":`, error.message);
    return false;
  }

  console.log(`  ✓ Bucket "${name}" created successfully`);
  return true;
}

async function setupStorage() {
  console.log('Setting up Supabase Storage buckets...\n');

  const buckets = [
    { name: 'thumbnails', public: true },
    { name: 'materials', public: true },
    { name: 'videos', public: true },
  ];

  let success = true;
  for (const bucket of buckets) {
    const result = await createBucket(bucket.name, bucket.public);
    if (!result) success = false;
  }

  if (success) {
    console.log('\n✅ All storage buckets set up successfully!');
  } else {
    console.log('\n❌ Some buckets failed to create. Check the errors above.');
  }
}

setupStorage();
