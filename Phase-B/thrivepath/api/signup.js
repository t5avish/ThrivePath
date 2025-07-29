/*
 signup.js

 API route for user registration. Creates new user accounts by validating
 email uniqueness, storing user credentials in the database, and returning
 the new user ID. Handles duplicate email prevention and provides the
 foundation for user authentication in the healthcare application.

 */

import { connectToDatabase } from '../lib/mongodb';
import cors from '../lib/cors';

export default async function handler(req, res) {
  await new Promise((resolve, reject) => cors(req, res, (result) => (result instanceof Error ? reject(result) : resolve())));

  if (req.method === 'POST') {
    try {
      const db = await connectToDatabase();
      const usersCollection = db.collection('users');
      let { name, email, password} = req.body;

      email = email.toLowerCase();

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        res.status(409).json({ message: 'Email already exists' });
        return;
      }
      const result = await usersCollection.insertOne({ name, email, password});
      res.status(200).json({ userId: result.insertedId });
    } catch (error) {
      console.error('Error during user creation:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}