import { connectToDatabase } from '../lib/mongodb';
import cors from '../lib/cors';

/**
 * API route to handle user sign-up.
 * 
 * This route accepts POST requests with user details. It checks if the email is already 
 * registered and if not, creates a new user in the database. The new user is assigned 
 * a default profile picture and their information is stored.
 */

export default async function handler(req, res) {
  await new Promise((resolve, reject) => cors(req, res, (result) => (result instanceof Error ? reject(result) : resolve())));

  if (req.method === 'POST') {
    try {
      const db = await connectToDatabase();
      const usersCollection = db.collection('users');
      let { name, email, password} = req.body;

      // Convert email to lowercase for case-insensitive comparison
      email = email.toLowerCase();

      // Check if email already exists in the database
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        res.status(409).json({ message: 'Email already exists' });
        return;
      }
    // Insert new user into the database
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