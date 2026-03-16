import { test, afterEach } from "vitest";
import { createSourceData } from "../src/io";
import { writeImageToMetadata } from './metadata'
import fs from 'fs'
import path from 'path'
import yaml from 'yaml'

const imagesPath = path.join(__dirname, '..', '..', 'fixtures')

const files = fs.readdirSync(imagesPath).filter((fileName) => fileName.endsWith('.yaml'))

files.map(async (file) => {
  const filePath = path.join(imagesPath, file)
  const description = yaml.parse(fs.readFileSync(filePath, 'utf8'))
  test(`Can read ${description.name} without error`, async () => {
    await createSourceData(
      {
        source: description.source
      }
    )
    writeImageToMetadata(description.source, description.name)
  })
})


