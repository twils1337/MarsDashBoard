const store = {
  rovers: Immutable.List['Curiosity', 'Opportunity', 'Spirit'],
  photos: Immutable.List([]),
  rover_i: 0,
  landing_date: '',
  launch_date: '',
  status: '',
  max_date: ''
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
            <h2 style="text-align:center;color:white;"> <a class="previous round" onclick=RoverNavigate(false)>&#8249;</a>  ${store.rovers[store.rover_i]}  <a class="next round" onclick=RoverNavigate(true)>&#8250; </a></h2>
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

// ------------------------------------------------------  COMPONENTS

// Handles the navigation between rovers based on the buttons beside the rover's name. Will update store once
// correct index is calculated.
// eslint-disable-next-line no-unused-vars
const RoverNavigate = (toNext) => {
  const roverIndex = GetNextRoverIndex(toNext);
  GetRoverDataAndImages(store, roverIndex);
};

const GetNextRoverIndex = (toNext) => {
  const i = store.rover_i;
  const roverSize = store.rovers.length;
  if (toNext) {
    if (i + 1 === store.rovers.length) {
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

// ------------------------------------------------------  API CALLS
/**
 * @description API call to back end node server to retrieve all
 */

const GetRoverDataAndImages = async(state, i) => {
  const newState = Object.assign({}, state);
  newState.rover_i = i;
  const roverName = state.rovers[newState.rover_i].toLowerCase();
  const dto = await fetch(`http://localhost:3000/rover?name=${roverName}`)
    .then(res => res.json());
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
 * @param {object} captionData - An object that houses all the necessary caption data for each photo. Utilizes the store as the GetRoverDataAndImages function
 *                               returns all the required data and updates the store with it.
 * @return {string} The proper HTML for the carousel items which is the photo & some info about the photo that is being displayed
 */
const GetCarouselItem = (photo, photoIndex) => {
  return `
    <div id="${store.rovers[store.rover_i]}_pic_${photoIndex}" class="carousel-item ${photoIndex === 0 ? 'active"' : '"'}>
        <img src="${photo.img_src}" style="min-height:10%; max-height:10%; width:100%;">
        <div class="carousel-caption d-none d-md-block">
            <h5>Status: ${store.status}</h5>
            <ul>
                <li>Camera: ${photo.camera}</li>
                <li>Photo Date: ${store.max_date}</li>
                <li>Launch Date: ${store.launch_date}</li>
                <li>Land Date: ${store.landing_date}</li>
            </ul>
        </div>      
    </div>`;
};
// ------------------------------------------------------
