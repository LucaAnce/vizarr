import * as utils from '../src/utils'
import fs from 'fs'
import path from 'path'
import { stringify } from 'yaml';

export async function writeImageToMetadata(url, imageName) {
  const node = await utils.open(url)
  const attrs = utils.resolveAttrs(node.attrs)
  const metadata = {
    source: url,
    name: imageName,
    type: attrs.multiscales[0].type,
    version: attrs.version,
    features: {
      multiscale: utils.isMultiscales(attrs)
    }
  }
  const savePath = path.join(__dirname, '..', '..', 'fixtures')
  fs.writeFileSync(path.join(savePath, `${imageName}.yaml`), stringify(metadata))
}
