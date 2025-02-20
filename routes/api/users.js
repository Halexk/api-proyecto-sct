const router = require('express').Router();
const User = require('../../models/user.model');
const BlacklistedToken = require('../../models/blacklistedToken.model');

// Hashing library
const bcrypt = require('bcrypt');
// JSON web token library
const jwt = require('jsonwebtoken');

const hashGen_base = 10;
let passwordHashingEnabled = true;

const jwtSecret = process.env.JWT_SECRET;

//Veryfy jwt env
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required!');
};

function generateJWT (userId) {
  const payload = { userId };
  const options = { expiresIn: '1h' }; // Set expiration time (e.g., 1 hour)
  return jwt.sign(payload, jwtSecret, options);
};

//Middleware Protecion
function verifyJWT (req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, jwtSecret)
    req.userId = decoded.userId // Attach user ID to request object
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
};
async function invalidateJWT (token) {
  // Check if token is already blacklisted
  const blacklistedToken = await BlacklistedToken.findOne({ token })

  if (blacklistedToken) {
    return res.status(400).json({ message: 'Token already blacklisted' })
  }

  // Add token to blacklist
  await new BlacklistedToken({ token }).save()
};

async function hashPassword (password) {
  const salt = await bcrypt.genSalt(hashGen_base) // Adjustable cost factor
  return await bcrypt.hash(password, salt)
};

// Get token
router.get('/protected-resource', verifyJWT, (req, res) => {
  res.json({ message: 'Welcome, authorized user!' })
});

router.post('/register', async (req, res) => {
  try {
    // Extract user data from request body
    const { name, email, password, role } = req.body

    // Validate user data (optional, implement your own validation logic)
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide all required fields' })
    }

    // Check for existing user with the same email
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    // Hash the password before saving
    const hashedPassword = await hashPassword(password)

    // Create a new user object
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role // Optional: set role if provided in request
    })

    // Save the user to the database
    const savedUser = await newUser.save()

    let token = generateJWT(savedUser._id)
    // Generate and send JWT
    savedUser.tokens.push({ token: token })
    await savedUser.save()

    // Respond with success message (or redirect to login page)
    res.json({ message: 'User created successfully!', user: savedUser }) // Adjust response as needed
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message })
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log(req.body)
    const { email, password } = req.body

    // Validate email and password presence
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide email and password' })
    }

    // Find the user by email with password field selection (for security)
    const user = await User.findOne({ email }).select('+password', '+tokens') // Select password and token field

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' }) // Avoid revealing if email exists
    }

    // Compare hashed passwords using bcrypt (if password hashing is implemented)
    const isMatch = passwordHashingEnabled
      ? await bcrypt.compare(password, user.password)
      : password === user.password // Adjust based on your implementation

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Login successful (replace with your desired response)
    res.json({ message: 'Login successful', user, token }) // Include relevant user data or token
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error', err })
  }
})

//Logout
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    const { userId } = req.body

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      await invalidateJWT(token) // Blacklist the token
    }

    // Validate email and password presence
    if (!userId) {
      return res.status(400).json({ message: 'Please provide token to revoke' })
    }

    // Invalidate JWT on server-side (optional) - e.g., blacklist tokens
    const user = await User.findById(userId)
    const index = user.tokens.findIndex(t => t.token === tokenToRevoke)

    if (index !== -1) {
      user.tokens.splice(index, 1)
      await user.save()
    }
    res.json({ message: 'Logout successful' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error', err })
  }
});

module.exports = router;
