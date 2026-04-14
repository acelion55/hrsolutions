import express from "express"
import { ObjectId } from "mongodb"
import { createHash } from "crypto"
import { connectToDatabase } from "../lib/mongodb.js"

const router = express.Router()
const USERS_COLLECTION = "users"

function hashPassword(plain) {
  return createHash("sha256").update(plain).digest("hex")
}

// Seed mock users into DB if collection is empty
const MOCK_USERS_SEED = [
  { mockId: "u1",  name: "Alice Johnson",  email: "alice@company.com",  role: "EMPLOYEE",       department: "ENGINEERING", avatar: "AJ", password: "alice123" },
  { mockId: "u2",  name: "Bob Martinez",   email: "bob@company.com",    role: "EMPLOYEE",       department: "FINANCE",     avatar: "BM", password: "bob123" },
  { mockId: "u3",  name: "Carol White",    email: "carol@company.com",  role: "HR_COORDINATOR", department: "HR",          avatar: "CW", password: "carol123" },
  { mockId: "u4",  name: "David Lee",      email: "david@company.com",  role: "HR_SPECIALIST",  department: "HR",          avatar: "DL", password: "david123" },
  { mockId: "u5",  name: "Eva Chen",       email: "eva@company.com",    role: "HR_MANAGER",     department: "HR",          avatar: "EC", password: "eva123" },
  { mockId: "u6",  name: "Frank Admin",    email: "frank@company.com",  role: "SYSTEM_ADMIN",   department: "OPERATIONS",  avatar: "FA", password: "frank123" },
  { mockId: "u7",  name: "Grace Kim",      email: "grace@company.com",  role: "EMPLOYEE",       department: "ENGINEERING", avatar: "GK", password: "grace123" },
  { mockId: "u8",  name: "Henry Scott",    email: "henry@company.com",  role: "EMPLOYEE",       department: "ENGINEERING", avatar: "HS", password: "henry123" },
  { mockId: "u9",  name: "Irene Patel",    email: "irene@company.com",  role: "EMPLOYEE",       department: "ENGINEERING", avatar: "IP", password: "irene123" },
  { mockId: "u10", name: "James Wilson",   email: "james@company.com",  role: "EMPLOYEE",       department: "OPERATIONS",  avatar: "JW", password: "james123" },
  { mockId: "u11", name: "Karen Brown",    email: "karen@company.com",  role: "EMPLOYEE",       department: "OPERATIONS",  avatar: "KB", password: "karen123" },
  { mockId: "u12", name: "Leo Turner",     email: "leo@company.com",    role: "EMPLOYEE",       department: "FINANCE",     avatar: "LT", password: "leo123" },
  { mockId: "u13", name: "Mia Nguyen",     email: "mia@company.com",    role: "EMPLOYEE",       department: "FINANCE",     avatar: "MN", password: "mia123" },
  { mockId: "u14", name: "Nathan Reed",    email: "nathan@company.com", role: "EMPLOYEE",       department: "MARKETING",   avatar: "NR", password: "nathan123" },
  { mockId: "u15", name: "Olivia Brooks",  email: "olivia@company.com", role: "EMPLOYEE",       department: "MARKETING",   avatar: "OB", password: "olivia123" },
]

async function seedIfEmpty(db) {
  const count = await db.collection(USERS_COLLECTION).countDocuments()
  if (count === 0) {
    const docs = MOCK_USERS_SEED.map(({ mockId, password, ...u }) => ({
      ...u,
      mockId,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    }))
    await db.collection(USERS_COLLECTION).insertMany(docs)
  }
}

function safeUser(doc) {
  const { passwordHash, _id, ...rest } = doc
  return { ...rest, id: _id.toString() }
}

// Find by either MongoDB _id or mockId field
async function findUserByAnyId(db, id) {
  if (ObjectId.isValid(id) && id.length === 24) {
    return db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(id) })
  }
  return db.collection(USERS_COLLECTION).findOne({ mockId: id })
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: "email and password required" })
  try {
    const { db } = await connectToDatabase()
    await seedIfEmpty(db)
    const user = await db.collection(USERS_COLLECTION).findOne({ email: String(email) })
    if (!user) return res.status(401).json({ message: "User not found" })
    if (user.passwordHash !== hashPassword(String(password))) return res.status(401).json({ message: "Incorrect password" })
    res.json(safeUser(user))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Login failed" })
  }
})

router.get("/", async (req, res) => {
  try {
    const { db } = await connectToDatabase()
    await seedIfEmpty(db)
    const docs = await db.collection(USERS_COLLECTION).find({}).toArray()
    res.json(docs.map(safeUser))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Unable to fetch users" })
  }
})

router.post("/", async (req, res) => {
  const { name, email, role, department, avatar, password } = req.body
  if (!name || !email || !role || !department || !password) {
    return res.status(400).json({ message: "name, email, role, department, password are required" })
  }
  try {
    const { db } = await connectToDatabase()
    const user = {
      name: String(name),
      email: String(email),
      role: String(role),
      department: String(department),
      avatar: String(avatar || name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)),
      passwordHash: hashPassword(String(password)),
      createdAt: new Date().toISOString(),
    }
    const result = await db.collection(USERS_COLLECTION).insertOne(user)
    res.status(201).json({ ...safeUser({ ...user, _id: result.insertedId }) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Unable to create user" })
  }
})

router.patch("/:id", async (req, res) => {
  const { id } = req.params
  const { name, email, role, department, avatar, password } = req.body

  const update = { updatedAt: new Date().toISOString() }
  if (name) update.name = String(name)
  if (email) update.email = String(email)
  if (role) update.role = String(role)
  if (department) update.department = String(department)
  if (avatar) update.avatar = String(avatar)
  if (password) update.passwordHash = hashPassword(String(password))

  try {
    const { db } = await connectToDatabase()

    // Build filter — support both ObjectId and mockId
    const filter = (ObjectId.isValid(id) && id.length === 24)
      ? { _id: new ObjectId(id) }
      : { mockId: id }

    const result = await db.collection(USERS_COLLECTION).findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    )

    if (!result) return res.status(404).json({ message: "User not found" })
    res.json(safeUser(result))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Unable to update user" })
  }
})

export default router
