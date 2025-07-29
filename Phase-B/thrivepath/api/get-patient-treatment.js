/*
 get-patient-treatment.js

 API route for retrieving a specific patient's treatment information and
 growth history data. Validates JWT authentication and patient ownership,
 then returns the patient's basic info, treatment details, protocol,
 and complete measurement history for dashboard display and chart rendering.
 
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

    const { patientId } = req.query;

    if (!patientId || !ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'Invalid or missing patient ID' });
    }

    const db = await connectToDatabase();

    const patient = await db.collection('patients').findOne({ 
      _id: new ObjectId(patientId),
      userId: decoded.userId 
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or unauthorized' });
    }

    res.status(200).json({ 
      patient: {
        name: patient.name,
        _id: patient._id,
        birthdate: patient.birthdate,
        treatment: patient.treatment,
        protocol: patient.protocol,
        history: patient.history,
      }
    });
  } catch (error) {
    console.error('Patient treatment retrieval error:', error);
    
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
};
