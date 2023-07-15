#!/usr/bin/env node

// @ts-ignore
import { dots } from "cli-spinners"
import { init, initSrv } from "./core.js"
import { runServer } from "./server.js"
import { deploy, fetch } from "./client.js"

const args = process.argv.splice(2,2)

if ( args[0] === "init" ) {

  if ( args.includes("--srv") ) {
    initSrv(process.cwd())
  } else {
    init(process.cwd())
  }



} else if ( args[0] === "deploy" ) {
  deploy(process.cwd())
} else if ( args[0] === "run" ) {
  runServer()
} else if ( args[0] === "fetch" ) {
  fetch(process.cwd(), args[1])
}
