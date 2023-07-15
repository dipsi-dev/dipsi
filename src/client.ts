
import path from "node:path"
import { readdirSync, readFileSync, unlinkSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import zl from "zip-lib"
import { create } from 'apisauce'
import { stdin, stdout } from 'node:process'
import { blue, cyan, red, green } from "console-log-colors"

const deploy = async (rootDir: string) => {
  const files = readdirSync(rootDir, { withFileTypes: true })
  const ignores = readFileSync(`${rootDir}/dipsi.ignore`, "utf8").split("\n")
  const zip = new zl.Zip()
  const source = `${rootDir}/.dipsi/source.zip`
  const cfgFile = `${rootDir}/.dipsi/.key.json`

  files.forEach(file => {

    if ( file.isDirectory() && !ignores.includes(file.name) ) {
      zip.addFolder(`${rootDir}/${file.name}`, file.name)
    } 

    if ( file.isFile() && !ignores.includes(file.name) ) {            zip.addFile(`${rootDir}/${file.name}`)
    }

  })

  // @ts-ignore
  stdout.write(cyan("Archiving..."))
  await zip.archive(source)
  const base64 = readFileSync(source, {encoding: 'base64'})
  // @ts-ignore
  stdout.clearLine()
  stdout.cursorTo(0)
  stdout.write(cyan("Loading info..."))
  const cfg = JSON.parse(readFileSync(cfgFile, 'utf8'))
  unlinkSync(source)
  const form = new FormData()
  form.append('source', base64)
  form.append('token', cfg.token)
  // @ts-ignore
  stdout.clearLine()
  stdout.cursorTo(0)
  stdout.write(cyan("Deploying..."))
  const api = create({ baseURL: cfg.host })
  const result: any = await api.post('/deploy', form)
  // @ts-ignore
  stdout.clearLine()
  stdout.cursorTo(0)
  
  if (!result.ok) {
    return stdout.write(red(`HTTP Error:  ${result.status}\n`))
  }
  
  stdout.write(green("Completed. \n"))
}

const fetch = async (rootDir: string, remoteUrl: string) => {
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/
  if (!urlRegex.test(remoteUrl)) {
    return console.log(red(`Invalid URL: ${remoteUrl}`))
  }

  if (!existsSync(`${rootDir}/.dipsi`)) {
    mkdirSync(`${rootDir}/.dipsi`)
  }
  
  const projectId = remoteUrl.split('/').at(-1)
  // @ts-ignore
  const baseURL = remoteUrl.replace(projectId, '')
  const api = create({ baseURL:  baseURL})
  
  stdout.write(cyan("Fetching..."))
  // @ts-ignore
  stdout.clearLine()
  stdout.cursorTo(0)
  const result = await api.get(`/cloning/${projectId}`)
  if (!result.ok) {
    return stdout.write(red(`HTTP Error:  ${result.status}\n`))
  }
  stdout.write(cyan("Extracting..."))
  // @ts-ignore
  writeFileSync(`${rootDir}/.dipsi/source.zip`, result.data, {encoding: 'base64'})
  await zl.extract(`${rootDir}/.dipsi/source.zip`, rootDir)
  // @ts-ignore
  stdout.clearLine()
  stdout.cursorTo(0)
  
  stdout.write(green("Completed."))
}

export { deploy, fetch }
