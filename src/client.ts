
import path from "node:path"
import { readdirSync, readFileSync, unlinkSync } from "node:fs"
import zl from "zip-lib"
import { create } from 'apisauce'

const deploy = async (rootDir: string) => {
  const files = readdirSync(rootDir, { withFileTypes: true })
  const ignores = readFileSync(`${rootDir}/dipsi.ignore`, "utf8").split("\n")
  const zip = new zl.Zip()
  const source = `${rootDir}/.dipsi/source.zip`
  const cfgFile = `${rootDir}/.dipsi/.key.json`

  files.forEach(file => {

    if ( file.isDirectory() && !ignores.includes(file.name) ) {
      console.log(file.name)
      zip.addFolder(`${rootDir}/${file.name}`, file.name)
    } 

    if ( file.isFile() && !ignores.includes(file.name) ) {            zip.addFile(`${rootDir}/${file.name}`)
    }

  })

  console.log("Archiving...")
  await zip.archive(source)
  const base64 = readFileSync(source, {encoding: 'base64'})
  console.log("Loading info...")
  const cfg = JSON.parse(readFileSync(cfgFile, 'utf8'))
  unlinkSync(source)
  const form = new FormData()
  form.append('source', base64)
  form.append('token', cfg.token)
  console.log("Deploying...")
  const api = create({ baseURL: cfg.host })
  const result: any = await api.post('/deploy', form)
  
  if (!result.ok) {
    return console.log(result.data?.message)
  }
  
  console.log("Completed.")
}

export { deploy }
