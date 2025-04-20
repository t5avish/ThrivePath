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
    const { patientId, newEntry } = req.body;

    if (!patientId || !newEntry || typeof newEntry.weight !== 'number' || typeof newEntry.height !== 'number') {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    const date = newEntry.date || new Date().toISOString(); // Use UTC date

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
      }
    );

    if (updateResult.modifiedCount > 0) {
      return res.status(200).json({ message: 'Patient history updated' });
    } else {
      return res.status(400).json({ message: 'Failed to update patient history' });
    }
  } catch (error) {
    console.error('Error updating patient history:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
