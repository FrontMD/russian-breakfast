document.addEventListener("DOMContentLoaded", () => {
    
    /* КАРТА НА СТРАНИЦЕ ГОРОДА */

    async function initMap() {
        // Промис `ymaps3.ready` будет зарезолвлен, когда загрузятся все компоненты основного модуля API
        await ymaps3.ready;
    
        const {YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker} = ymaps3;
    
        const mapContainer = document.querySelector('[data-js="cityMap"]')

        if(!mapContainer) return
    
        const map = new YMap(
            mapContainer,
            {
                location: {
                    center: [49.106414,55.796127],
                    zoom: 12
                }
            },
            [
                new YMapDefaultSchemeLayer({}),
                new YMapDefaultFeaturesLayer({})
              ]
        );
    
        /*coordsArr.forEach(coords => {        
            const markerElement = document.createElement('img');
              markerElement.className = 'map-block__placemark';
              markerElement.src = "./img/placemark.png";
              map.addChild(new YMapMarker({coordinates: coords}, markerElement));
        });*/
    
    }

    initMap();



    /* СЛАЙДЕР НА СТРАНИЦЕ РЕСТОРАНА */

    function restaurantSliderInit() {
        const restaurantSlider = document.querySelector('[data-js="restaurantSlider"]')

        if(!restaurantSlider) return

        const sliderPrev = restaurantSlider.querySelector('[data-js="sliderControlPrev"]')
        const sliderNext = restaurantSlider.querySelector('[data-js="sliderControlNext"]')

        const restaurantSliderEx = new Swiper(restaurantSlider, {
            loop: true,
            speed: 400,
            navigation: {
                nextEl: sliderNext,
                prevEl: sliderPrev,
              },
        });
    }

    restaurantSliderInit()

})
