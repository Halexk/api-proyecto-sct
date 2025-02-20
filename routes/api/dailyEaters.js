const router = require('express').Router()

const DailyEaters = require('../../models/dailyEaters.model')

// Create a Daily Eaters Record
router.post('/daily-eaters-lunch', async (req, res) => {
  try {
    // Set the `updatedAt` field to the current time before saving
    console.log(req.body,'aqui esta el body');
   

    const newDailyEaters = new DailyEaters(req.body)
    const savedDailyEaters = await newDailyEaters.save()
    res.status(201).json(savedDailyEaters)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error creating daily eaters record' })
  }
})
router.post('/daily-eaters-breakfast', async (req, res) => {
  try {
    // Set the `updatedAt` field to the current time before saving
    console.log(req.body,'aqui esta el body');
   

    const newDailyEaters = new DailyEaters(req.body)
    const savedDailyEaters = await newDailyEaters.save()
    res.status(201).json(savedDailyEaters)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error creating daily eaters record' })
  }
})
router.post('/daily-eaters-dinner', async (req, res) => {
  try {
    // Set the `updatedAt` field to the current time before saving
    console.log(req.body,'aqui esta el body');
   

    const newDailyEaters = new DailyEaters(req.body)
    const savedDailyEaters = await newDailyEaters.save()
    res.status(201).json(savedDailyEaters)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error creating daily eaters record' })
  }
})

// Edit a Daily Eaters Record
router.put('/daily-eaters/:id', async (req, res) => {
  const { id } = req.params

  try {
    // Find the record by ID
    const dailyEatersToUpdate = await DailyEaters.findById(id)
    if (!dailyEatersToUpdate) {
      return res.status(404).json({ message: 'Daily eaters record not found' })
    }

    // Update relevant fields (replace with specific fields to update)
    dailyEatersToUpdate.department =
      req.body.department || dailyEatersToUpdate.department
    dailyEatersToUpdate.workersEating =
      req.body.workersEating || dailyEatersToUpdate.workersEating

    // Set the `updatedAt` field to the current time before saving
    dailyEatersToUpdate.updatedAt = Date.now()

    // Save the updated document
    const updatedDailyEaters = await dailyEatersToUpdate.save()
    console.log(updatedDailyEaters)
    res.json(updatedDailyEaters)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error updating daily eaters record' })
  }
})

// Get All Entries for Today
router.get('/today-lunch', async (req, res) => {
  try {
    // Set the start and end dates for today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0) // Set to midnight
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999) // Set to the end of the day

    // Find all records within the today date range
    const dailyEatersForToday = await DailyEaters.find({ type: 'lunch',
      createdDate: { $gte: todayStart, $lte: todayEnd }
    })
    console.log(dailyEatersForToday);

    res.json(dailyEatersForToday)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error retrieving daily eaters for today' })
  }
})
router.get('/today-breakfast', async (req, res) => {
  try {
    // Set the start and end dates for today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0) // Set to midnight
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999) // Set to the end of the day

    // Find all records within the today date range
    const dailyEatersForToday = await DailyEaters.find({ type: 'breakfast',
      createdDate: { $gte: todayStart, $lte: todayEnd }
    })
    console.log(dailyEatersForToday);

    res.json(dailyEatersForToday)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error retrieving daily eaters for today' })
  }
})
router.get('/today-dinner', async (req, res) => {
  try {
    // Set the start and end dates for today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0) // Set to midnight
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999) // Set to the end of the day

    // Find all records within the today date range
    const dailyEatersForToday = await DailyEaters.find({ type: 'dinner',
      createdDate: { $gte: todayStart, $lte: todayEnd }
    })
    console.log(dailyEatersForToday);

    res.json(dailyEatersForToday)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error retrieving daily eaters for today' })
  }
})

// Check if Daily Eaters Entry Exists for Today
router.get('/daily-eaters/today/exists', async (req, res) => {
  try {
    // Set the start and end dates for today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0) // Set to midnight
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999) // Set to the end of the day

    // Check if a record exists for today
    const dailyEatersForToday = await DailyEaters.findOne({
      createdDate: { $gte: todayStart, $lte: todayEnd }
    })

    if (dailyEatersForToday) {
      res.status(409).json({ message: 'Entry already exists for today' })
    } else {
      res.json({ exists: false }) // Indicate no entry exists
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error checking daily eaters for today' })
  }
})

module.exports = router
