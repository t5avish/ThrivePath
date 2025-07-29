/*
 get-user-patients.js

 API route for retrieving all patients associated with the authenticated user.
 Validates JWT authentication and returns a complete list of the user's patients
 along with the total count, used for populating the patient selection screen
 and dashboard overview.
 
*/

import { connectToDatabase } from '../lib/mongodb';
import jwt from 'jsonwebtoken';
import cors from '../lib/cors';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  await new Promise((resolve, reject) => cors(req, res, (result) => (result instanceof Error ? reject(result) : resolve())));
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const db = await connectToDatabase();
    
    const patients = await db.collection('patients')
      .find({ 
        userId: decoded.userId 
      })
      .toArray();

    res.status(200).json({ 
      patients: patients,
      count: patients.length
    });
  } catch (error) {
    console.error('Patients retrieval error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(500).json({ 
      message: 'Internal Server Error', 
      details: error.message 
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}