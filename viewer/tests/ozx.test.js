import { test, afterEach } from "vitest";
import { createSourceData } from "../src/io";
import { writeImageToMetadata } from './metadata'


test("Can read .ozx file without error", async () => {
  const baseUrl = `http://${process.env.VITE_TEST_STATIC_SERVER_HOST}:${process.env.VITE_TEST_STATIC_SERVER_PORT}`;
  const imageDir = 'backpack'
  const imagePath = `${imageDir}/image.ozx`
  let url = `${baseUrl}/${imagePath}`;

  const config = {
    source: url,
  };

  await createSourceData(config);
  await writeImageToMetadata(url, imageDir)

});


