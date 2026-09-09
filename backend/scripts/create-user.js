require('dotenv').config();

const bcrypt = require('bcrypt');
const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');

const {
  connectToDatabase,
  getClient
} = require('../src/config/db');

const BCRYPT_ROUNDS = 12;

async function main() {
  const rl = readline.createInterface({
    input,
    output
  });

  try {
    const usernameInput = await rl.question('Username: ');
    const username = usernameInput.trim().toLowerCase();

    if (!username) {
      throw new Error('Username cannot be empty');
    }

    const roleInput = await rl.question(
      'Role (admin/user): '
    );

    const role = roleInput.trim().toLowerCase();

    if (!['admin', 'user'].includes(role)) {
      throw new Error(
        'Role must be either admin or user'
      );
    }

    const password = await rl.question('Password: ');

    if (password.length < 12) {
      throw new Error(
        'Password must contain at least 12 characters'
      );
    }

    const confirmPassword =
      await rl.question('Confirm password: ');

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    console.log('Hashing password...');

    const passwordHash =
      await bcrypt.hash(password, BCRYPT_ROUNDS);

    const db = await connectToDatabase();

    const usersCollection =
      db.collection('users');

    const existingUser =
      await usersCollection.findOne({
        username
      });

    if (existingUser) {
      throw new Error(
        `User "${username}" already exists`
      );
    }

    const now = new Date();

    await usersCollection.insertOne({
      username,
      passwordHash,
      role,
      active: true,
      createdAt: now,
      updatedAt: now
    });

    console.log('');
    console.log('User created successfully.');
    console.log(`Username: ${username}`);
    console.log(`Role: ${role}`);
    console.log('Active: true');

  } catch (error) {
    console.error('');
    console.error(
      'Failed to create user:',
      error.message
    );

    process.exitCode = 1;

  } finally {
    rl.close();

    try {
      await getClient().close();
    } catch {
      // Ignore close error.
    }
  }
}

main();
