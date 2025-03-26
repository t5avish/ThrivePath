import { connectToDatabase } from '../lib/mongodb';
import jwt from 'jsonwebtoken';
import cors from '../lib/cors';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  // Enable CORS
  await new Promise((resolve, reject) => cors(req, res, (result) => (result instanceof Error ? reject(result) : resolve())));
  
  // Check if it's a GET request
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Check for authorization header
  const authHeader = req.headers.authorization;
  console.log("Received Authorization Header:", authHeader); // Debug log

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    // Extract token from header (remove 'Bearer ' prefix)
    const token = authHeader.split(' ')[1];
    console.log("Extracted Token:", token); // Debug log

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", decoded); // Debug log
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Find user by ID (convert to ObjectId)
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { name: 1, email: 1 } }
    );

    console.log("Found User:", user); // Debug log

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user info
    res.status(200).json({
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('User info retrieval error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token', details: error.message });
    }
    
    res.status(500).json({ 
      message: 'Internal Server Error', 
      details: error.message 
    });
  }
}

// Ensure CORS is configured
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}