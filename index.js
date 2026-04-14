import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import ticketsRouter from "./routes/tickets.js"
import auditLogsRouter from "./routes/audit-logs.js"
import usersRouter from "./routes/users.js"

dotenv.config()

const app = express()
const port = parseInt(process.env.PORT || "5000", 10)

app.use(cors({ origin: true }))
app.use(express.json())

app.get("/", (req, res) => res.send({ status: "ok", message: "HRMS backend running" }))
app.use("/api/tickets", ticketsRouter)
app.use("/api/audit-logs", auditLogsRouter)
app.use("/api/users", usersRouter)

app.listen(port, () => {
  console.log(`HRMS backend listening on http://localhost:${port}`)
})
