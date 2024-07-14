import pkg from 'pg';
const { Pool } = pkg;

// PostgreSQL connection using DATABASE_URL from Render
const pool = new Pool({
  connectionString:
    process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL');
  }
});

export { pool };
