import { connectToDatabase } from '../lib/mongodb';
import jwt from 'jsonwebtoken';
import cors from '../lib/cors';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  await new Promise((resolve, reject) =>
    cors(req, res, (result) => (result instanceof Error ? reject(result) : resolve()))
  );

  if (req.method !== 'DELETE') {
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
    const { patientId, date } = req.body;

    console.log('Delete request received:', { patientId, date });

    if (!patientId || !date) {
      return res.status(400).json({ message: 'Missing patientId or date' });
    }

    const patient = await db.collection('patients').findOne({
      _id: new ObjectId(patientId),
      userId: decoded.userId,
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or unauthorized' });
    }

    // Debug: Log the patient's history to see the date formats
    console.log('Patient history entries:', patient.history?.map(entry => ({
      date: entry.date,
      weight: entry.weight,
      height: entry.height
    })));

    // Try to find the exact entry first
    const entryToDelete = patient.history?.find(entry => entry.date === date);
    console.log('Found entry to delete:', entryToDelete);

    if (!entryToDelete) {
      // If exact match not found, try to find similar dates
      const similarEntries = patient.history?.filter(entry => 
        entry.date.includes(date) || date.includes(entry.date)
      );
      console.log('Similar entries found:', similarEntries);
      
      return res.status(400).json({ 
        message: 'Entry not found. Date format might not match.',
        receivedDate: date,
        availableDates: patient.history?.map(entry => entry.date) || []
      });
    }

    const updateResult = await db.collection('patients').updateOne(
      { _id: new ObjectId(patientId), userId: decoded.userId },
      {
        $pull: {
          history: { date },
        },
      }
    );

    console.log('Update result:', updateResult);

    if (updateResult.modifiedCount > 0) {
      return res.status(200).json({ message: 'Entry deleted successfully' });
    } else {
      return res.status(400).json({ 
        message: 'Failed to delete entry - no matching entry found',
        receivedDate: date,
        availableDates: patient.history?.map(entry => entry.date) || []
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}