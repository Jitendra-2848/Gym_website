const { MongoClient } = require('mongodb');
require('dotenv').config();

(async () => {
  try {
    const client = new MongoClient(process.env.MONGO_URL, { useUnifiedTopology: true });
    await client.connect();
    const adminDb = client.db('admin');
    const status = await adminDb.command({ connectionStatus: 1 });
    console.log('Authenticated user roles:');
    console.log(JSON.stringify(status.authInfo && status.authInfo.authenticatedUserRoles, null, 2));
    await client.close();
  } catch (e) {
    console.error('Check roles error:', e);
    process.exit(1);
  }
})();
