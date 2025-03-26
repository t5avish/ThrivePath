import { connectToDatabase } from '../lib/mongodb';
import jwt from 'jsonwebtoken';
import cors from '../lib/cors';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  await new Promise((resolve, reject) => cors(req, res, (result) => (result instanceof Error ? reject(result) : resolve())));
  
  // Check if it's a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Check for authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Validate incoming patient data
    const patientData = req.body;
    if (!patientData.name || !patientData.gender || !patientData.birthdate) {
      return res.status(400).json({ message: 'Incomplete patient information' });
    }

    // Prepare patient document
    const newPatient = {
      ...patientData,
      userId: decoded.userId,
      createdAt: new Date()
    };

    // Save patient to database
    const result = await db.collection('patients').insertOne(newPatient);

    // Return success response
    res.status(201).json({ 
      message: 'Patient added successfully', 
      patientId: result.insertedId 
    });
  } catch (error) {
    console.error('Patient save error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(500).json({ message: 'Internal Server Error' });
  }
}