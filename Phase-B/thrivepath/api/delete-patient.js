import { connectToDatabase } from '../../lib/mongodb';
import jwt from 'jsonwebtoken';
import cors from '../../lib/cors';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  await new Promise((resolve, reject) =>
    cors(req, res, (result) =>
      result instanceof Error ? reject(result) : resolve()
    )
  );

  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.error('Authorization token missing');
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    console.log("Token received:", token);
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    const { patientId } = req.body;
    console.log("Deleting patient with ID:", patientId);

    if (!patientId || !ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'Invalid or missing patient ID' });
    }

    const db = await connectToDatabase();
    console.log("Database connection established");

    const result = await db.collection('patients').deleteOne({
      _id: new ObjectId(patientId),
      userId: decoded.userId,
    });

    console.log("Delete result:", result);

    if (result.deletedCount === 0) {
      console.error("No matching patient found for deletion");
      return res.status(404).json({ message: 'Patient not found or not authorized to delete' });
    }

    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error("Error during patient deletion:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.status(500).json({ message: 'Internal Server Error' });
  }
}
