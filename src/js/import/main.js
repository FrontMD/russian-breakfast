document.addEventListener("DOMContentLoaded", () => {
    restaurantSliderInit() // строит слайдер на странице заведения
    citiesListBuild() // строит список городов
    restaurantsListBuild() // строит список ресторанов города
    restaurantPageBuild() // наполняет страницу ресторана

    
    /* КАРТА НА СТРАНИЦЕ ГОРОДА */
    async function initMap(currentRestaurantList) {
        const mapContainer = document.querySelector('[data-js="cityMap"]')

        if(!mapContainer) return
        
        await ymaps3.ready;
    
        const {YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker} = ymaps3;
    
    
        const map = new YMap(
            mapContainer,
            {
                location: {
                    center: currentRestaurantList[0].coords,
                    zoom: 12
                }
            },
            [
                new YMapDefaultSchemeLayer({}),
                new YMapDefaultFeaturesLayer({})
              ]
        );
    
        currentRestaurantList.forEach(item => {        
            const markerElement = document.createElement('img');
              markerElement.className = 'map-block__placemark';
              markerElement.setAttribute('data-js', 'openRestaurantBtn')
              markerElement.setAttribute('data-id', item.id)
              markerElement.src = "./img/placemark.png";
              map.addChild(new YMapMarker({coordinates: item.coords}, markerElement));
        });
    
    }

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


    /* БИЛД СПИСКА ГОРОДОВ */
    function citiesListBuild() {
        const citiesList = document.querySelector('[data-js="citiesList"]')

        if(!citiesList) return

        let citiesListArr = restaurantsList

        citiesListArr.forEach(city => {
            let cityCard = document.createElement('div')
            cityCard.classList.add('cities-list__card', 'cities-card')
            
            cityCard.innerHTML = `                              
                                    <div class="cities-card__img">
                                        <img src="${city.photo}" alt="${city.name}">
                                    </div>
                                    <div class="cities-card__title">${city.name}</div>
                                    <a class="btn cities-card__btn with-angles" href="city.html?city-id=${city.id}" target="">
                                        <span class="btn__text">смотреть</span>
                                        <span class="btn__icon">
                                            <svg>
                                                <use xlink:href="./img/sprites/sprite.svg#btn_arrow"></use>
                                            </svg>
                                        </span>
                                    </a> 
                                `

            citiesList.appendChild(cityCard)
        })
    }

    /* БИЛД СПИСКА ЗАВЕДЕНИЙ */
    function restaurantsListBuild() {
        const restaurantsListEl = document.querySelector('[data-js="restaurantList"]')

        if(!restaurantsListEl) return

        const cardsOnPage = 9

        let currentCityId = false
        let currentPaginationId = 0

        let currentPageParams = window.location.search.slice(1).split("&")
        let currentCityParam = currentPageParams.find(item => /^city-id=/.test(item));
        let currentPaginationParam = currentPageParams.find(item => /^pagination=/.test(item));

        if(currentCityParam !== undefined) {
            currentCityId = currentCityParam.split("=")[1]
        }

        if(currentPaginationParam !== undefined) {
            currentPaginationId = currentPaginationParam.split("=")[1]
        }

        let restaurantListArr = restaurantsList
        let currentCityObj = restaurantListArr[0]

        if(currentCityId) {
            currentCityObj = restaurantListArr.find(item => item.id == currentCityId) || restaurantListArr[0]
        }

        
        // ищем нужные рестораны с учётом пагинации
        let currentRestaurantFullList = currentCityObj.restaurants
        let currentRestaurantList = currentRestaurantFullList.slice(currentPaginationId * cardsOnPage, currentPaginationId * cardsOnPage + cardsOnPage)


        //ставим название города
        const cityNameEl = document.querySelector('[data-js=cityName]')
        if(cityNameEl) {
            cityNameEl.innerHTML = currentCityObj.name
        }

        // добавляем карточки ресторанов
        currentRestaurantList.forEach(restaurant => {
            let restaurantCard = document.createElement('div')
            restaurantCard.classList.add('city-list__card', 'restaurant-card')
            
            restaurantCard.innerHTML = `                              
                                    <div class="restaurant-card__img">
                                        <img src="${restaurant.photos[0]}" alt="">
                                    </div>
                                    <div class="restaurant-card__title">${restaurant.name}</div>
                                    <div class="restaurant-card__text">${restaurant.shortText}</div>
                                    <button class="btn restaurant-card__btn with-angles" data-id="${restaurant.id}" target="" data-js="openRestaurantBtn">
                                        <span class="btn__text">смотреть</span>
                                        <span class="btn__icon">
                                            <svg>
                                                <use xlink:href="./img/sprites/sprite.svg#btn_arrow"></use>
                                            </svg>
                                        </span>
                                    </button>
                                `

            restaurantsListEl.appendChild(restaurantCard)
        })


        // формируем пагинацию
        const paginationContainer = document.querySelector('[data-js="paginationContainer"]')
        let pagesCount = Math.ceil(currentRestaurantFullList.length / cardsOnPage)

        if(paginationContainer && pagesCount > 1) {
            setPagination(paginationContainer, pagesCount, currentPaginationId, 'city.html?city-id=' + currentCityId)
        }

        openRestauranModal(currentRestaurantList)

        // строим карту
        initMap(currentRestaurantList);
    }

    /* НАПОЛНЕНИЕ СТРАНИЦЫ РЕСТОРАНА */
    function restaurantPageBuild() {
        const restaurantPage = document.querySelector('[data-js="restaurantPage"]');

        if(!restaurantPage) return

        let currentRestaurantId = false

        let currentPageParams = window.location.search.slice(1).split("&")
        let currentRestaurantParam = currentPageParams.find(item => /^rest-id=/.test(item));

        const citiesListArr = restaurantsList
        let restaurantsListArr = citiesListArr.map(item => item.restaurants)
        restaurantsListArr = [].concat(...restaurantsListArr)

        let currentRestaurant = restaurantsListArr[0]
        
        if(currentRestaurantParam !== undefined) {
            currentRestaurantId = currentRestaurantParam.split("=")[1]
            currentRestaurant = restaurantsListArr.find(item => item.id == currentRestaurantId)
        }

        let recipesListArr = recipesList

        restaurantPage.querySelectorAll('[data-js="restaurantBack"]').forEach(item => {
            item.setAttribute('href', `city.html?city-id=${currentRestaurant.cityId}`)
        })
        restaurantPage.querySelector('[data-js="restaurantTitle"]').innerHTML = currentRestaurant.name
        restaurantPage.querySelector('[data-js="restaurantCity"]').innerHTML = citiesListArr.find(item => item.id = currentRestaurant.cityId).name

        let restaurantSlider = document.querySelector('[data-js="restaurantSlider"] .swiper-wrapper')
        currentRestaurant.photos.forEach(item => {
            let slide = document.createElement('div')
            slide.classList.add('restaurant__slide', 'swiper-slide')

            slide.innerHTML = `
                                <div class="restaurant__img">
                                    <img src=${item} alt="фото ресторана">
                                </div>
                            `

            restaurantSlider.appendChild(slide)
        })

        restaurantPage.querySelector('[data-js="restaurantText"]').innerHTML = currentRestaurant.modalText
        restaurantPage.querySelector('[data-js="restaurantQuote"]').innerHTML = currentRestaurant.quote
        restaurantPage.querySelector('[data-js="restaurantPhoto"]').setAttribute('src', currentRestaurant.authorPhoto)
        restaurantPage.querySelector('[data-js="restaurantName"]').innerHTML = currentRestaurant.authorName
        restaurantPage.querySelector('[data-js="restaurantPosition"]').innerHTML = currentRestaurant.authorPosition

        let restaurantMenu = document.querySelector('[data-js="restaurantMenu"]')
        currentRestaurant.menu.forEach(item => {
            let menuItem = document.createElement('div')
            menuItem.classList.add('restaurant-menu__item')

            menuItem.innerHTML = recipesListArr.find(recipe => recipe.id == item).name

            restaurantMenu.appendChild(menuItem)
        })


        restaurantPage.querySelector('[data-js="restaurantAddress"]').innerHTML = currentRestaurant.address
        restaurantPage.querySelector('[data-js="restaurantMode"]').innerHTML = currentRestaurant.mode
        restaurantPage.querySelector('[data-js="restaurantPhone"]').setAttribute('href', 'tel:' + currentRestaurant.phone.replace(/[^+\d]/g, ""))
        restaurantPage.querySelector('[data-js="restaurantPhone"]').innerHTML = currentRestaurant.phone
        restaurantPage.querySelectorAll('[data-js="restaurantSite"]').forEach(item => {
            item.setAttribute('href', currentRestaurant.site)
            if(item.classList.contains('restaurant__site')) {
                item.innerHTML = currentRestaurant.site
            }
        })


    }

})


/* ФОРМИРОВАНИЕ ПАГИНАЦИИ */
function setPagination(container, count, activePage, pageAddress) {
    container.innerHTML = `
                            <a class="pagination__control pagination__prev" href="javascript:void(0)" data-js="prevBtn">
                                <svg>
                                <use xlink:href="./img/sprites/sprite.svg#btn_arrow"></use>
                                </svg>
                            </a>
                            <div class="pagination__items" data-js="paginationItems"></div>
                            <a class="pagination__control pagination__next" href="javascript:void(0)" data-js="nextBtn">
                                <svg>
                                <use xlink:href="./img/sprites/sprite.svg#btn_arrow"></use>
                                </svg>
                            </a>
                        `
    
    activePage = parseInt(activePage)
    container.setAttribute("data-current", activePage)
    let paginationItems = container.querySelector('[data-js="paginationItems"]')

    for(i=0; i<count; i++) {
        let paginationItem = document.createElement('a')
        paginationItem.classList.add('pagination__item')
        paginationItem.setAttribute('data-page', i)
        paginationItem.setAttribute('href', `${pageAddress}&pagination=${i}`)

        if(activePage == i) {
            paginationItem.classList.add('pagination__item--active')
        }

        paginationItem.innerHTML = i + 1

        paginationItems.appendChild(paginationItem)
    }

    if(activePage > 0) {
        container.querySelector('[data-js="prevBtn"]').setAttribute("href", `${pageAddress}&pagination=${activePage - 1}`)
    }

    if(activePage < count - 1) {
        container.querySelector('[data-js="nextBtn"]').setAttribute("href", `${pageAddress}&pagination=${activePage + 1}`)
    }
}

/* ОТКРЫТИЕ МОДАЛКИ РЕСТОРАНА */
function openRestauranModal(currentRestaurantList) {

    const cityPage = document.querySelector('[data-js="cityPage"]')
    
    cityPage.addEventListener("click", e => {
        if(e.target.closest('[data-js="openRestaurantBtn"]')) {

            const modal = document.querySelector('[data-js="restaurantModal"]')
            
            if(!modal) return

            let currentRestaurant = currentRestaurantList.find(item => item.id == e.target.closest('[data-js="openRestaurantBtn"]').dataset.id)

            modal.querySelector('[data-js="restaurantModalImg"]').setAttribute('src', currentRestaurant.photos[0])
            modal.querySelector('[data-js="restaurantModalTitle"]').innerHTML = currentRestaurant.name
            modal.querySelector('[data-js="restaurantModalText"]').innerHTML = currentRestaurant.modalText
            modal.querySelector('[data-js="restaurantModalQuote"]').innerHTML = currentRestaurant.quote
            modal.querySelector('[data-js="restaurantModalPhoto"]').setAttribute('src', currentRestaurant.authorPhoto)
            modal.querySelector('[data-js="restaurantModalName"]').innerHTML = currentRestaurant.authorName
            modal.querySelector('[data-js="restaurantModalPosition"]').innerHTML = currentRestaurant.authorPosition
            modal.querySelector('[data-js="restaurantModalBtn"]').setAttribute('href', `restaurant.html?rest-id=${currentRestaurant.id}`)

            modals.open(modal)
        }
    })
}

const restaurantsList = [
    {
        id: '0',
        name: 'Москва',
        photo: './img/cities/moskva.jpg',
        restaurants: [
            {
                id: '0',
                cityId: '0',
                name: 'Ресторан 1',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.617698, 55.755864]
            },
            {
                id: '1',
                cityId: '0',
                name: 'Ресторан 2',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.573825, 55.701206]
            },
            {
                id: '2',
                cityId: '0',
                name: 'Ресторан 3',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.647117, 55.607820]
            },
            {
                id: '3',
                cityId: '0',
                name: 'Ресторан 4',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.555037, 55.651959]
            },
            {
                id: '4',
                cityId: '0',
                name: 'Ресторан 5',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.707697, 55.794493]
            },
            {
                id: '5',
                cityId: '0',
                name: 'Ресторан 6',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.479439, 55.788706]
            },
            {
                id: '6',
                cityId: '0',
                name: 'Ресторан 7',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.612970, 55.867080]
            },
            {
                id: '7',
                cityId: '0',
                name: 'Ресторан 8',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.807255, 55.712913]
            },
            {
                id: '8',
                cityId: '0',
                name: 'Ресторан 9',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.615976, 55.781018]
            },
            {
                id: '9',
                cityId: '0',
                name: 'Ресторан 10',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.629127, 55.745969]
            },
            {
                id: '10',
                cityId: '0',
                name: 'Ресторан 11',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.578916, 55.742597]
            },
            {
                id: '11',
                cityId: '0',
                name: 'Ресторан 12',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.653037, 55.718311]
            },
            {
                id: '12',
                cityId: '0',
                name: 'Ресторан 13',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.693683, 55.617634]
            },
            {
                id: '13',
                cityId: '0',
                name: 'Ресторан 14',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.741503, 55.767542]
            },
            {
                id: '14',
                cityId: '0',
                name: 'Ресторан 15',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.467736, 55.791797]
            },
            {
                id: '15',
                cityId: '0',
                name: 'Ресторан 16',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.631518, 55.907472]
            },
            {
                id: '16',
                cityId: '0',
                name: 'Ресторан 17',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.600435, 55.825459]
            }  
        ]
    },
    {
        id: '1',
        name: 'Санкт-Петербург',
        photo: './img/cities/sankt_peterburg.jpg',
        restaurants: [
            {
                id: '17',
                cityId: '1',
                name: 'Ресторан 17',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.617698, 55.755864]
            },
            {
                id: '18',
                cityId: '1',
                name: 'Ресторан 18',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.573825, 55.701206]
            },
            {
                id: '19',
                cityId: '1',
                name: 'Ресторан 19',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.647117, 55.607820]
            },
            {
                id: '20',
                cityId: '1',
                name: 'Ресторан 20',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.555037, 55.651959]
            },
            {
                id: '21',
                cityId: '1',
                name: 'Ресторан 21',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.707697, 55.794493]
            },
            {
                id: '22',
                cityId: '1',
                name: 'Ресторан 22',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.479439, 55.788706]
            },
            {
                id: '23',
                cityId: '1',
                name: 'Ресторан 23',
                shortText: 'Дополнительный <br>текст',
                modalText: 'Название Ресторана - краткое описание заведение одним предложением в 2-3 строки.',
                quote: '«Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt imperdiet mauris, id placerat libero sodales vitae. Morbi eget turpis ut leo.»',
                authorName: 'Фамилия Имя',
                authorPosition: 'шеф-повар',
                authorPhoto: './img/modal_photo.jpg',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla justo lectus, dapibus in leo eget, mattis interdum dui. Nullam cursus porttitor feugiat. Etiam sollicitudin semper urna, at tempus nisi pulvinar vel. Donec velit augue, fringilla at auctor quis, elementum id tellus. Aenean ornare tempor enim id volutpat. Nulla molestie tortor sit amet nibh eleifend, ut eleifend elit consectetur. Aliquam quis molestie purus. Donec vitae ipsum neque. In ac fermentum lectus. Vestibulum placerat dolor sit amet ligula pulvinar, sit amet ullamcorper nulla placerat. Nullam luctus tellus eu sem iaculis, pulvinar congue turpis rutrum. Quisque tincidunt fermentum ligula, sed luctus tortor blandit at. Etiam luctus augue eu tortor dictum convallis eu non ante. Proin lectus lorem, pulvinar a tincidunt et, egestas nec risus.',
                photos: [
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg',
                    './img/restaurant_img.jpg'
                ],
                // список id рецептов
                menu: ['0','1','2','3'],
                address: 'Адрес',
                mode: 'Режим работы',
                phone: 'Номер телефона',
                site: 'Сайт',
                coords: [37.612970, 55.867080]
            },

        ]
    },
    {
        id: '2',
        name: 'Краснодар',
        photo: './img/cities/krasnodar.jpg',
        restaurants: []
    },
    {
        id: '3',
        name: 'Сочи',
        photo: './img/cities/sochi.jpg',
        restaurants: []
    },
    {
        id: '4',
        name: 'Самара',
        photo: './img/cities/samara.jpg',
        restaurants: []
    },
    {
        id: '5',
        name: 'Ростов-на-Дону',
        photo: './img/cities/rostov-na-donu.jpg',
        restaurants: []
    },
    {
        id: '6',
        name: 'Воронеж',
        photo: './img/cities/moskva.jpg',
        restaurants: []
    },
    {
        id: '7',
        name: 'Нижний Новгород',
        photo: './img/cities/sankt_peterburg.jpg',
        restaurants: []
    },
    {
        id: '8',
        name: 'Казань',
        photo: './img/cities/krasnodar.jpg',
        restaurants: []
    },
    {
        id: '9',
        name: 'Уфа',
        photo: './img/cities/sochi.jpg',
        restaurants: []
    },
    {
        id: '10',
        name: 'Новосибирск',
        photo: './img/cities/samara.jpg',
        restaurants: []
    },
    {
        id: '11',
        name: 'Екатеринбург',
        photo: './img/cities/rostov-na-donu.jpg',
        restaurants: []
    },
    {
        id: '12',
        name: 'Тюмень',
        photo: './img/cities/moskva.jpg',
        restaurants: []
    },
    {
        id: '13',
        name: 'Ярославль',
        photo: './img/cities/sankt_peterburg.jpg',
        restaurants: []
    },
    {
        id: '14',
        name: 'Красноярск',
        photo: './img/cities/krasnodar.jpg',
        restaurants: []
    },
    {
        id: '15',
        name: 'Волгоград',
        photo: './img/cities/sochi.jpg',
        restaurants: []
    },
    {
        id: '16',
        name: 'Тула',
        photo: './img/cities/samara.jpg',
        restaurants: []
    },
    {
        id: '17',
        name: 'Калуга',
        photo: './img/cities/rostov-na-donu.jpg',
        restaurants: []
    },

    {
        id: '18',
        name: 'Рязань',
        photo: './img/cities/sochi.jpg',
        restaurants: []
    },
    {
        id: '19',
        name: 'Кострома',
        photo: './img/cities/samara.jpg',
        restaurants: []
    },
    {
        id: '20',
        name: 'Астрахань',
        photo: './img/cities/rostov-na-donu.jpg',
        restaurants: []
    },
]

const recipesList = [
    {
        id: "0",
        name: "Блинчики со сморчками и индюшкой"
    },
    {
        id: "1",
        name: "Каша «Гурьевская» с брусникой и клюквой моченой"
    },
    {
        id: "2",
        name: "Яичница-болтунья в печи с полевыми травами"
    },
    {
        id: "3",
        name: "Молочный десерт из парного молочка с желе из морошки"
    },
]

