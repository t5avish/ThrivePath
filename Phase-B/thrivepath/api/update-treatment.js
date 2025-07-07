import { connectToDatabase } from '../lib/mongodb';
import jwt from 'jsonwebtoken';
import cors from '../lib/cors';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  await new Promise((resolve, reject) => cors(req, res, (result) => (result instanceof Error ? reject(result) : resolve())));

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

    const { patientId, updatedTreatment } = req.body;
    if (!patientId || !updatedTreatment) {
      return res.status(400).json({ message: 'Incomplete data' });
    }

    const patient = await db.collection('patients').findOne({ 
      _id: new ObjectId(patientId),
      userId: decoded.userId,
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or unauthorized' });
    }

    const result = await db.collection('patients').updateOne(
      { _id: new ObjectId(patientId), userId: decoded.userId },
      { $set: { treatment: { ...updatedTreatment } } }
    );

    if (result.modifiedCount > 0) {
      return res.status(200).json({ message: 'Treatment updated successfully' });
    } else {
      return res.status(404).json({ message: 'No changes made or patient not found' });
    }
  } catch (error) {
    console.error('Update treatment error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.status(500).json({ message: 'Internal Server Error' });
  }
}
