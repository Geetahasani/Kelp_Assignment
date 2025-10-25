const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'env', '.env.dev') });
const { app, connectDatabase } = require('./src/app');

// Import models to register them with Sequelize
require('./src/models/userModel');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Startup error:', error.message);
    process.exit(1);
  }
};

startServer();