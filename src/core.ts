import inquirer from "inquirer"
import crypto from "node:crypto"
import rdl from "node:readline"
import { create } from 'apisauce'
import { existsSync, mkdirSync, writeFileSync} from "node:fs"
import { blue, cyan, red, green } from "console-log-colors"
import os from "node:os"
import { v4 } from "uuid"

const init = (rootDir: string) => {
  
  const configJSON: any = {}
  const std = process.stdout

  inquirer.prompt([
     {
       type: "input",
       name: "srv",
       message: "Server"
     },
     {
       type: "input",
       name: "id",
       message: "Remote ID"
     },
     {
       type: "input",
       name: "username",
       message: "Username"
     },
     {
       type: "password",
       name: "password",
       message: "Password"
     }
   ])
   .then( async (answers: any) => {
     const api = create({ baseURL: answers.srv })
     const form = new FormData()
     form.append("username", answers.username)
     form.append("password", answers.password)
     form.append("id", answers.id)
     form.append("host", answers.srv)
     
     std.write(cyan("Authenticating..."))
     std.write("")

     const result:any = await api.post('/authenticate', form)
     const strIgnore: string = "node_modules\n\n.dipsi"
     if (!result.ok) return console.log(`${red("ERROR: ")}${result.data?.message}`)
     if ( !existsSync(`${rootDir}/.dipsi`) ) {            mkdirSync(`${rootDir}/.dipsi`)
     }

     writeFileSync(`${rootDir}/.dipsi/.key.json`, `${JSON.stringify({
       token: result.data,
       host: answers.srv
     })}`, "utf8")
     writeFileSync(`${rootDir}/dipsi.ignore`, strIgnore, "utf8")

     setTimeout(() => console.log(green("Initialize complete")), 1000)
   })
   .catch( (error: any) => {
     console.log(error)
   })
   
}

const initSrv = (rootDir: string) => {
  let configJSON: any = {}
  
  if (!existsSync(`${os.homedir()}/.dipsi`)) {
    mkdirSync(`${os.homedir()}/.dipsi`)
  }

  inquirer.prompt([
     {
       type: "input",
       name: "username",
       message: "Username"
     },
     {
       type: "password",
       name: "password",
       message: "Password"
     }
   ])
   .then( (answers: any) => {
     const key = crypto.createHash("sha256")
     const str = key.update(answers.password).digest("hex")
     const id = v4().split('-')[0]

     configJSON.username = answers.username
     configJSON.password = str
     configJSON.projectDir = rootDir
     
     if ( !existsSync(`${rootDir}/.dipsi`) ) {
	     mkdirSync(`${rootDir}/.dipsi`)
     }
     
     if ( !existsSync(`${os.homedir()}/.dipsi/${id}`) ) {
	     mkdirSync(`${os.homedir()}/.dipsi/${id}`)
     }

     writeFileSync(`${os.homedir()}/.dipsi/${id}/.auth.json`, JSON.stringify(configJSON), "utf8")

    console.log(`Initialized successfull.`)
    console.log(`Your project ID: ${green(id)}`)
   })
   .catch( (error: any) => {
     console.log(error)
   })
}

export { init, initSrv }
