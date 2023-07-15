import express from "express"
import formidable from 'formidable'
import { createServer } from "node:http"
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs"
import crypto from "node:crypto"
import { Server } from "socket.io"
import { green } from "console-log-colors"
import jwt from "jsonwebtoken"
import os from "node:os"
import { extract, archiveFolder } from "zip-lib"

const app = express()
const server = createServer(app)
const io = new Server(server)
const SERVER_KEY = "key8788bd18-456789032dftAe-cubcAx342109-csn"
const HOST = '0.0.0.0'
const PORT = 5026
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])

app.get("/cloning/:projectId", async (req: any, res: any) => {
  const { projectId } = req.params
  const sourceDir = `${os.homedir()}/.dipsi/${projectId}`
  if (!existsSync(sourceDir)) { return res.status(404).send("Project ID not found.") }
  // @ts-ignore
  const { projectDir } = JSON.parse(readFileSync(`${sourceDir}/.auth.json`, 'utf8'))
  await archiveFolder(projectDir, `${sourceDir}/source.zip`)
  const source = readFileSync(`${sourceDir}/source.zip`, {encoding: 'base64'})
  
  return res.send(source)
})

app.post("/authenticate", (req: any, res: any, next: any) => {
  const form = formidable({})

  form.parse(req, async (err: any, fields: any, files: any) => {
    if (err) {
      next(err)
      return;
    }

    if ( !existsSync(`${os.homedir()}/.dipsi/${fields.id}/.auth.json`) ) return res.status(500).send({message: "Remote ID not exists"})
    
    const auth = JSON.parse(readFileSync(`${os.homedir()}/.dipsi/${fields.id}/.auth.json`, "utf8"))
    const key = crypto.createHash("sha256")
    const passwd = key.update(fields.password).digest("hex")

    if (  fields.username !== auth.username || passwd !== auth.password) return res.status(401).send({message: "Username or password is wrong"})
    const token = jwt.sign({id: fields.id, host: fields.host}, SERVER_KEY)
    res.json(token)
  })
})

app.post("/deploy", (req: any, res: any, next: any) => {
  const form = formidable({})

  form.parse(req, async (err: any, fields: any, files: any) => {
    const token = fields.token
    const source = fields.source
    const sourceInfo: any = jwt.verify(token, SERVER_KEY)
    
    if (!sourceInfo) return res.status(401).send({message: "Unauthorized"})
    
    const srcFile = `${os.homedir()}/.dipsi/${sourceInfo.id}/source.zip`
    
    if (!existsSync(`${os.homedir()}/.dipsi/${sourceInfo.id}`)) return res.status(500).send({message: "Remote ID not exists"})
    
    const x: any = JSON.parse(readFileSync(`${os.homedir()}/.dipsi/${sourceInfo.id}/.auth.json`, 'utf8'))
    
    if (!existsSync(`${x.projectDir}/.dipsi`)) return res.status(500).send({message: "Remote path not found. Maybe its been removed"})
    
    writeFileSync(srcFile, source, {encoding: 'base64'})
    
    await extract(srcFile, `${x.projectDir}`)
    unlinkSync(srcFile)
    
    return res.send("Completed")
  })
})

const runServer = () => {
  server.listen(PORT, HOST, () => {
    console.log(green("Server runing..."))
  })
}

export { runServer }
