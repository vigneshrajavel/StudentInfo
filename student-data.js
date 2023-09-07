const express = require('express');
const bodyParser = require('body-parser');
/* const mongoose = require('mongoose'); */
const { MongoClient, ObjectId } = require('mongodb')
const cors = require('cors');

const app = express();
const port = 3000;
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'studentDB';

app.use(express.static('student-info'));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
async function connect() {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);

    console.log('Connected to MongoDB');
    return { client, db };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}
/* mongoose.connect('mongodb://127.0.0.1:27017/studentDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a Student schema
const studentSchema = new mongoose.Schema({
  name: String,
  age: Number,
  rollNo: Number,
  gender: String,
});

const Student = mongoose.model('Student', studentSchema); */

// Create a new student
app.post('/students', async (req, res) => {
  const { studentname, studentage, rollno, studentgender } = req.body;
  console.log("Request Body ", req.body);
  const { client, db } = await connect();
  try {
    const Student = db.collection('Student');
    const result = await Student.insertOne({ studentname, studentage, rollno, studentgender });
    res.status(201).json({ message: `${studentname} created successfully`, studentId: result.insertedId });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.close();
  }
});

// Get all students
app.get('/students', async (req, res) => {
  const { client, db } = await connect();
  try {
    const Student = db.collection('Student');
    const result = await Student.find().toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  } finally {
    client.close();
  }
});

// Get a single student by roll number
app.get('/students/:id', async (req, res) => {
  const { id } = req.params;
  const { studentname, studentage, rollno, studentgender } = req.body;
  const { client, db } = await connect();
  try {
    const Student = db.collection('Student');
    const result = await Student.findOne({ _id: new ObjectId(id) }, { $set: { studentname, studentage, rollno, studentgender } });
    if (result) {
      res.status(200).json({ result, message: 'Student retrived successfully' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error retriving student', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.close();
  }
});

// Update a student by roll number
app.put('/students/:id', async (req, res) => {
  const { id } = req.params;
  const { studentname, studentage, rollno, studentgender } = req.body;
  const { client, db } = await connect();
  try {
    const Student = db.collection('Student');
    const result = await Student.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { studentname, studentage, rollno, studentgender } }, { returnOriginal: false });
    if (result) {
      res.status(200).json({ message: 'student updated successfully' });
    } else {
      res.status(404).json({ error: 'Student not found' });
    }
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  } finally {
    client.close();
  }
});

// Delete a student by roll number
app.delete('/students/:id', async (req, res) => {
  const { id } = req.params;
  const { client, db } = await connect();
  try {
    const Student = db.collection('Student');
    const result = await Student.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Student deleted successfully' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
