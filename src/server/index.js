require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');
// eslint-disable-next-line no-unused-vars
const { debugPort } = require('process');
const Immutable = require('immutable');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../public')));

/**
 * @description GET: /rover?name=<roverName>
 * @return {object} dto containing the required data from the manifest and photos of the rover whose name was passed in
 */
app.get('/rover', async(req, res) => {
  try {
    const roverName = req.query.name;
    const manifest = await getManifest(roverName);
    const photos = await getRoverPhotos(roverName, manifest.max_date);
    const dto = Object.assign({}, manifest);
    dto.photos = photos;
    res.send(dto);
  } catch (err) {
    console.log('error:', err);
  }
});

/**
 * @description NASA rover manifest api call
 * @param {string} roverName - name of the rover that we want the manifest for
 * @return {object} reduced object of the original returned manifest object from the NASA which includes the landing date, launch date, status, and max date of 
 *                  the rover that was passed in from the rover get call above
 */
const getManifest = async(roverName) => {
  const manifestResult = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${roverName}?api_key=${process.env.API_KEY}`)
    .then(res => res.json());
  const manifest = manifestResult.photo_manifest;
  const requiredProperties = Immutable.Set(['landing_date', 'launch_date', 'status', 'max_date']);
  return requiredProperties.reduce(function(obj, key) { obj[key] = manifest[key]; return obj; }, {});
};

/**
 * @description NASA rover photos call
 * @param {string} roverName - name of rover that we want to retrieve photos for
 * @param {string} capturedDate - the date when we want the photos to be captured on
 * @returns {object[]} a list of objects who has img_src & camera property
 *          object.img_src: is the url that the ui will use to retrieve the photo
 *          camera: the camera that the photo was taken from
 */
const getRoverPhotos = async(roverName, capturedDate) => {
  const result = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?earth_date=${capturedDate}&api_key=${process.env.API_KEY}`)
    .then(res => res.json());
  return result.photos.map(function(photo) { return { img_src: photo.img_src, camera: photo.camera.name }; });
};

app.listen(port, () => console.log(`Mars Dash Board BE listening on port ${port}!`));
