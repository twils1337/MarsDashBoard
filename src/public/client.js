const store = {
  // eslint-disable-next-line no-undef
  rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
  // eslint-disable-next-line no-undef
  photos: Immutable.List([]),
  rover_i: 0,
  landing_date: '',
  launch_date: '',
  status: '',
  max_date: '',
  show_status: true,
  show_camera: true,
  show_photo_date: true,
  show_landing_date: true
};

const root = document.getElementById('root');

const updateStore = (store, newState) => {
  store = Object.assign(store, newState);
  render(root, store);
};

const render = async(root, state) => {
  root.innerHTML = App(state);
};

// function to handle dynamic generation of the app's dashboard
const App = (state) => {
  return `
        <main>
           <h1 style="text-align:center; color:#ff5349;">Mars Dash Board</h1>
           <br>
           <br>
            <section>
            <div class="inline">
            <h2 style="text-align:center;color:white;"> <a class="previous round" onclick=RoverNavigate(false)>&#8249;</a>  ${store.rovers.get(store.rover_i)} <a class="next round" onclick=RoverNavigate(true)>&#8250;</a>${GetSettingsButtonAndMenu()}</h2>
            </div>
            </section>
            ${GetDisplayCarouselForRover()}
        </main>
        <footer></footer>
    `;
};

window.addEventListener('load', async() => {
  await GetRoverDataAndImages(store, 0);
  render(root, store);
});

// ------------------------------------------------------  UI Functionality

// Handles the navigation between rovers based on the buttons beside the rover's name. Will update store once
// correct index is calculated.
// eslint-disable-next-line no-unused-vars
const RoverNavigate = (toNext) => {
  const roverIndex = GetNextRoverIndex(toNext);
  GetRoverDataAndImages(store, roverIndex);
};

const GetNextRoverIndex = (toNext) => {
  const i = store.rover_i;
  const roverSize = store.rovers.size;
  if (toNext) {
    if (i + 1 === roverSize) {
      return 0;
    } else {
      return i + 1;
    }
  } else {
    if (i - 1 < 0) {
      return roverSize - 1;
    } else {
      return i - 1;
    }
  }
};

// Handles dynamic nature of the caption for each photo.
// eslint-disable-next-line no-unused-vars
const OnSettingChange = (setting) => {
  if (setting.id === 'statusSetting') {
    const updatedSetting = { show_status: setting.checked };
    updateStore(store, updatedSetting);
  }
  if (setting.id === 'cameraSetting') {
    const updatedSetting = { show_camera: setting.checked };
    updateStore(store, updatedSetting);
  }
  if (setting.id === 'photoDateSetting') {
    const updatedSetting = { show_photo_date: setting.checked };
    updateStore(store, updatedSetting);
  }
  if (setting.id === 'landingDateSetting') {
    const updatedSetting = { show_landing_date: setting.checked };
    updateStore(store, updatedSetting);
  }
};

// ------------------------------------------------------  API CALLS
/**
 * @description API call to back end node server to retrieve all the data and images for the rovers
 */

const GetRoverDataAndImages = async(state, i) => {
  const newState = Object.assign({}, state);
  newState.rover_i = i;
  const roverName = state.rovers.get(newState.rover_i).toLowerCase();
  const dto = await fetch(`http://localhost:3000/rover?name=${roverName}`)
    .then(res => res.json());
  // eslint-disable-next-line no-undef
  dto.photos = Immutable.List(dto.photos);
  Object.assign(newState, dto);
  updateStore(store, newState);
};
// ------------------------------------------------------ 

// ------------------------------------------------------  UI generation
/**
 * @description Generates the Boostrap carousel for each rover once the data & photos of the rover
 *              have been retrieved.
 * @return {string} The proper html for the carousel of photos for the rover.
 */
const GetDisplayCarouselForRover = () => {
  const photos = store.photos;
  let carousel = `
    <div id="roverCarousel" class="carousel slide" data-ride="carousel" data-interval="10000">
        <div class="carousel-inner">
            ${photos.map((photo, i) => GetCarouselItem(photo, i)).join(' ')}`;
  carousel += `
        <a class="carousel-control-prev" href="#roverCarousel" role="button" data-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next" href="#roverCarousel" role="button" data-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="sr-only">Next</span>
        </a>
    </div>`;
  return carousel;
};

/**
 * @description Helper function to help generate the indiviual items in the rover photo carousel
 * @param {object} photo - A photo object from a rover which contains the url to a photo from a particular rover to be retrieved & the name of the camera that rover used
 * @param {number} photoIndex - Index of photo in photos array. Passed in primarily to generate id tag for the photo
 * @return {string} The proper HTML for the carousel items which is the photo & some info about the photo that is being displayed
 */
const GetCarouselItem = (photo, photoIndex) => {
  return `
    <div id="${store.rovers[store.rover_i]}_pic_${photoIndex}" class="carousel-item ${photoIndex === 0 ? 'active"' : '"'}>
        <img src="${photo.img_src}" style="min-height:10%; max-height:10%; width:100%;">
        ${GetCaptionsForPhoto(photo)}
    </div>`;
};

/**
 * @description Generates captions for earch photo on the caraousel based on which settings they have enabled in the gear icon at the top right of page.
 * @param {object} photo - The photo object that will be used to generate captions.
 * @return {string} The proper html for caption of the photo.
 */
const GetCaptionsForPhoto = (photo) => {
  const isDisplayable = store.show_status || store.show_camera || store.show_photo_date || store.show_landing_date;
  if (isDisplayable) {
    let captionBlock = '<div class="carousel-caption d-none d-md-block">';
    if (store.show_status) {
      captionBlock += `<h5>Status: ${store.status}</h5>`;
    }
    if (store.show_camera || store.show_photo_date || store.show_landing_date) {
      captionBlock += '<ul>';
      if (store.show_camera) {
        captionBlock += `<li>Camera: ${photo.camera}</li>`;
      }
      if (store.show_photo_date) {
        captionBlock += `<li>Photo Date: ${store.max_date}</li>`;
      }
      if (store.show_landing_date) {
        captionBlock += `  <li>Landing Date: ${store.landing_date}</li>`;
      }
      captionBlock += '</ul>';
    }
    captionBlock += '</div>';
    return captionBlock;
  }
  return '';
};

/**
 * @description Generates display settings button and drop down menu.
 * @return {string} The proper html for the setting button and drop down menu for the pieces of the display the user can enable/disable.
 */
const GetSettingsButtonAndMenu = () => {
  const settingsButton =
  `<button class="btn btn-default dropdown-toggle" type="button" id="settingsDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" style="float:right;background-color: white;">
    <img src='./assets/images/gear.svg' aria-hidden="true"</img>
    <span class="caret"></span>
  </button>
  <ul class="dropdown-menu checkbox-menu allow-focus">
    <label style="display:block;"><input id="statusSetting" type="checkbox"  style="padding:5px;margine-left:5px;position:relative;" onchange=OnSettingChange(this) ${store.show_status ? 'checked' : ''}> Status </label>
    <label style="display:block;"><input id="cameraSetting" type="checkbox"  style="padding:5px;margine-left:5px;position:relative;" onchange=OnSettingChange(this) ${store.show_camera ? 'checked' : ''}> Camera </label>
    <label style="display:block;"><input id="photoDateSetting" type="checkbox"  style="padding:5px;margine-left:5px;position:relative;" onchange=OnSettingChange(this) ${store.show_photo_date ? 'checked' : ''}> Photo Date </label>
    <label style="display:block;"><input id="landingDateSetting" type="checkbox"  style="padding:5px;margine-left:5px;position:relative;" onchange=OnSettingChange(this) ${store.show_landing_date ? 'checked' : ''}> Land Date </label>
  </ul>`;
  return settingsButton;
};
// ------------------------------------------------------
