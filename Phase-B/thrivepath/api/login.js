/*
 login.js

 API route for user authentication. Validates user credentials against the
 database, performs email and password verification, and generates a JWT
 token for session management. Returns the authentication token on successful
 login for use in subsequent API requests.
 
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

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const db = await connectToDatabase();
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user || password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
