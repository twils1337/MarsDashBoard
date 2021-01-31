
let store = {
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    photos:[],
    rover_i: 0,
    landing_date: '',
    launch_date: '',
    status: '',
    max_date : ''
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    return `
        <header></header>
        <main>
           <h1 style="text-align:center;">Mars Dash Board</h1>
           <br>
           <br>
            <section>
            <div class="inline">
            <h2 style="text-align:center;"> <a class="previous round" onclick=RoverNavigate(false)>&#8249;</a>  ${store.rovers[store.rover_i]}  <a class="next round" onclick=RoverNavigate(true)>&#8250; </a></h2>
            </div>
            </section>
            ${getDisplayCarouselForRover()}
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', async () => {
    await getImagesForRover(store, 0)
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

//Handles the navigation between rovers based on the buttons beside the rover's name. Will update store once
//correct index is calculated.
const RoverNavigate = (toNext) => {
    const rover_i = GetNextRoverIndex(toNext);
    getImagesForRover(store, rover_i);
}

const GetNextRoverIndex = (toNext) => {
    const i = store.rover_i;
    const roverSize = store.rovers.length;
    if (toNext){
        if (i + 1 === store.rovers.length){
            return 0;
        }
        else{
            return i + 1;
        }
    }
    else{
        if (i - 1 < 0){
            return roverSize - 1;
        }
        else{
            return i - 1;
        }
    }
}

// ------------------------------------------------------  API CALLS

const getImagesForRover = async (state, i) => {
    const newState = Object.assign({}, state);
    newState.rover_i = i
    const roverName = state.rovers[newState.rover_i].toLowerCase();
    const dto = await fetch(`http://localhost:3000/rover?name=${roverName}`)
                      .then(res => res.json());
    Object.assign(newState, dto);
    updateStore(store, newState);
}

const getDisplayCarouselForRover = () =>{
    const photos = store.photos;
    let carousel = `
    <div id="roverCarousel" class="carousel slide" data-ride="carousel">
        <div class="carousel-inner">
            ${getCarouselItem(photos[0], 0, store, true)}`;
    for (let i = 1; i < store.photos.length; i++) {
        carousel += getCarouselItem(photos[i], i, store, false);       
    };
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
}

const getCarouselItem = (photo, i, captionData, isActive) => {
    return `
    <div id="${captionData.rovers[captionData.rover_i]}_pic${i}" class="carousel-item ${isActive ? "active\"":"\""}>
        <img src="${photo.img_src}" style="min-height:10%; max-height:10%; width:100%;">
        <div class="carousel-caption d-none d-md-block">
            <h5>Camera: ${photo.camera}</h5>
            <ul>
                <li>Status: ${captionData.status}</li>
                <li>Photo Date: ${captionData.max_date}</li>
                <li>Launch Date: ${captionData.launch_date}</li>
                <li>Land Date: ${captionData.landing_date}</li>
            </ul>
        </div>      
    </div>`;
}

