import * as utils from '../src/utils'
import fs from 'fs'
import path from 'path'
import { stringify } from 'yaml';

export async function writeImageToMetadata(url, imageDir) {
  const node = await utils.open(url)
  const attrs = utils.resolveAttrs(node.attrs)
  const metadata = {
    source: 'https://ome-zarr-scivis.s3.us-east-1.amazonaws.com/v0.5/96x2-ozx/backpack.ozx',
    accessDate: '16-03-2026',
    name: attrs.multiscales[0].name,
    type: attrs.multiscales[0].type,
    version: attrs.version,
    features: {
      multiscale: utils.isMultiscales(attrs)
    }
  }
  const savePath = path.join(__dirname, '..', '..', 'fixtures', imageDir)
  fs.writeFileSync(path.join(savePath, 'description.yaml'), stringify(metadata))
}
