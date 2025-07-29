/*
  add-new-patient.js

  API route for adding new patients to the system. Validates JWT authentication,
  ensures required patient information (name, gender, birthdate) is provided,
  and stores the patient record in MongoDB with the authenticated user's ID.
  Returns the created patient ID on successful creation.
  
*/

import { connectToDatabase } from '../lib/mongodb';
import jwt from 'jsonwebtoken';
import cors from '../lib/cors';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  await new Promise((resolve, reject) => cors(req, res, (result) => (result instanceof Error ? reject(result) : resolve())));
  
  if (req.method !== 'POST') {
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

    const patientData = req.body;
    if (!patientData.name || !patientData.gender || !patientData.birthdate) {
      return res.status(400).json({ message: 'Incomplete patient information' });
    }

    const newPatient = {
      ...patientData,
      userId: decoded.userId,
    };

    const result = await db.collection('patients').insertOne(newPatient);

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