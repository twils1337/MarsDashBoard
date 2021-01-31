require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const { debugPort } = require('process')
const Immutable = require('immutable')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

app.get('/rover', async (req, res) => {
    try {
        const roverName = req.query.name;     
        const manifest = await getManifest(roverName);
        const photos = await getRoverPhotos(roverName, manifest.max_date);
        const dto = Object.assign({}, manifest);
        dto.photos = photos;
        res.send(dto)
    } catch (err) {
        console.log('error:', err);
    }
})

const getManifest = async (roverName) => {
    const manifestResult = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${roverName}?api_key=${process.env.API_KEY}`)
                                .then(res => res.json());
    const manifest = manifestResult.photo_manifest;
    const requiredProperties = Immutable.Set(['landing_date', 'launch_date', 'status', 'max_date']);
    return requiredProperties.reduce(function(obj, key) {obj[key] = manifest[key]; return obj;}, {});
}

const getRoverPhotos = async (roverName, recentDate) => {
    const result = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?earth_date=${recentDate}&api_key=${process.env.API_KEY}`)
                        .then(res => res.json());
    return result.photos.map(function(photo) { return {img_src: photo.img_src, camera: photo.camera.name }; });
}

app.listen(port, () => console.log(`Mars Dash Board BE listening on port ${port}!`))