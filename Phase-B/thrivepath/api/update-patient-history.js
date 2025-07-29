/*
 update-patient-history.js

 API route for adding new growth measurement entries to a patient's history.
 Validates JWT authentication and patient ownership, then appends new weight
 and height measurements to the patient's record while also updating their
 current treatment protocol.

 */

import { connectToDatabase } from '../lib/mongodb';
import jwt from 'jsonwebtoken';
import cors from '../lib/cors';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  await new Promise((resolve, reject) =>
    cors(req, res, (result) => (result instanceof Error ? reject(result) : resolve()))
  );

  if (req.method !== 'PUT') {
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
    const { patientId, newEntry, protocol, treatment } = req.body;

    if (
      !patientId ||
      !newEntry ||
      typeof newEntry.weight !== 'number' ||
      typeof newEntry.height !== 'number' ||
      !protocol ||
      !treatment
    ) {
      return res.status(400).json({
        message: 'Missing or invalid required fields: patientId, newEntry, protocol, or treatment',
      });
    }

    const date = newEntry.date || new Date().toISOString();

    const patient = await db.collection('patients').findOne({
      _id: new ObjectId(patientId),
      userId: decoded.userId,
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or unauthorized' });
    }

    const updateResult = await db.collection('patients').updateOne(
      { _id: new ObjectId(patientId), userId: decoded.userId },
      {
        $push: {
          history: {
            weight: newEntry.weight,
            height: newEntry.height,
            date,
          },
        },
        $set: {
          protocol,
          treatment,
        },
      }
    );

    if (updateResult.modifiedCount > 0) {
      return res.status(200).json({ message: 'Patient history, protocol, and treatment updated successfully' });
    } else {
      return res.status(400).json({ message: 'Failed to update patient record' });
    }
  } catch (error) {
    console.error('Error updating patient:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
