const restaurantsListPath = 'https://raw.githubusercontent.com/FrontMD/russian-breakfast/master/dist/data/restaurantsList.json';
const recipesListPath = 'https://raw.githubusercontent.com/FrontMD/russian-breakfast/master/dist/data/recipesList.json';

document.addEventListener("DOMContentLoaded", () => {
    const windowWidth = window.innerWidth


    restaurantSliderInit() // строит слайдер на странице заведения
    partnersMediaSliderInit() // строит слайдер на странице "партнеры"
    citiesListBuild() // строит список городов
    restaurantsListBuild() // строит список ресторанов города
    restaurantPageBuild() // наполняет страницу ресторана
    recipeCategoriesListBuild() // строит список категорий рецептов
    recipesListBuild() // строит список рецептов
    recipePageBuild() // наполняет страницу рецепта
    spoilerController() // управляет спойлерами

    if(windowWidth < 1280) {
        openCookModal() // открывает модалку повара
    }
    
    /* КАРТА НА СТРАНИЦЕ ГОРОДА */
    function initMap(currentRestaurantList, currentCityArr) {
        const mapContainer = document.querySelector('[data-js="cityMap"]')

        if(!mapContainer) return

        ymaps.ready(function () {

            let zoom = 11;
            if(windowWidth < 768) {
                zoom = 13
            }
        
            const map = new ymaps.Map(mapContainer, {
                center: currentCityArr.coords,
                zoom: zoom,
                controls: []
            });

            let myGeoObjects = []
            
            currentRestaurantList.forEach(item => {
                
                item.coords.forEach(coordsItem => {
                    let currentPlacemark = new ymaps.Placemark(
                        coordsItem,
                        {},
                        {
                          iconLayout: 'default#image',
                          iconImageHref: './img/placemark.png',
                          iconImageSize: [42, 60,5],
                          iconImageOffset: [-21, -40]
                        }
                      );
    
                      const modal = document.querySelector('[data-js="restaurantModal"]')
    
                      if(modal) {
                          currentPlacemark.events.add('click', function () {
                            openRestauranModalById(modal, item)
                          })
                      }
    
                      myGeoObjects.push(currentPlacemark)
                })

            });

            var clusterer = new ymaps.Clusterer({
                gridSize: 120,
                preset: 'islands#redClusterIcons'
            });
            clusterer.add(myGeoObjects);
            map.geoObjects.add(clusterer);

         });
    
    }

    /* СЛАЙДЕР НА СТРАНИЦЕ РЕСТОРАНА */
    function restaurantSliderInit() {
        const restaurantSliders = document.querySelectorAll('[data-js="restaurantSlider"]')

        if(restaurantSliders.length < 1) return

        restaurantSliders.forEach(restaurantSlider => {
            const sliderPrev = restaurantSlider.querySelector('[data-js="sliderControlPrev"]')
            const sliderNext = restaurantSlider.querySelector('[data-js="sliderControlNext"]')
    
            const restaurantSliderEx = new Swiper(restaurantSlider, {
                loop: true,
                speed: 400,
                spaceBetween: 20,
                navigation: {
                    nextEl: sliderNext,
                    prevEl: sliderPrev,
                },
    
                breakpoints: {
                    767: {
                        spaceBetween: 0
                    }
                }
            });
        })
    }

    /* СЛАЙДЕР НА СТРАНИЦЕ ПАРТНЕРЫ */
    function partnersMediaSliderInit() {
        const partnersMediaSlider = document.querySelector('[data-js="partnersMediaList"]')

        if(!partnersMediaSlider || windowWidth > 1023) return

        const sliderPrev = partnersMediaSlider.querySelector('[data-js="sliderControlPrev"]')
        const sliderNext = partnersMediaSlider.querySelector('[data-js="sliderControlNext"]')

        const partnersMediaSliderEx = new Swiper(partnersMediaSlider, {
            loop: true,
            speed: 400,
            spaceBetween: 20,
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

        fetch(restaurantsListPath, {
            method: 'get'
        }).then(response => response.json()).then(json => {
            let citiesListArr = json
    
            citiesListArr.forEach(city => {
                let cityCard = document.createElement('div')
                cityCard.classList.add('cities-list__card', 'cities-card')
                
                cityCard.innerHTML = `                              
                                        <div class="cities-card__img">
                                            <img src="${city.photo}" alt="${city.name}">
                                        </div>
                                        <div>
                                            <div class="cities-card__title">${city.name}</div>
                                            <a class="btn cities-card__btn with-angles" href="city.html?city-id=${city.id}" target="">
                                                <span class="btn__text">смотреть</span>
                                                <span class="btn__icon">
                                                    <svg>
                                                        <use xlink:href="./img/sprites/sprite.svg#btn_arrow"></use>
                                                    </svg>
                                                </span>
                                            </a> 
                                        </div>
                                    `
    
                citiesList.appendChild(cityCard)
            })
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

        fetch(restaurantsListPath, {
            method: 'get'
        }).then(response => response.json()).then(json => {

            let restaurantListArr = json
            let currentCityObj = restaurantListArr[0]

            if(currentCityId) {
                currentCityObj = restaurantListArr.find(item => item.id == currentCityId) || restaurantListArr[0]
            }

            //ставим название города
            const cityNameEl = document.querySelector('[data-js=cityName]')
            if(cityNameEl) {
                cityNameEl.innerHTML = currentCityObj.name
            }
            
            // ищем нужные рестораны с учётом пагинации
            let currentRestaurantFullList = currentCityObj.restaurants
            let currentRestaurantList = currentRestaurantFullList
            if(windowWidth > 767) {
                currentRestaurantList = currentRestaurantFullList.slice(currentPaginationId * cardsOnPage, currentPaginationId * cardsOnPage + cardsOnPage)
            }

            // добавляем карточки ресторанов
            currentRestaurantList.forEach(restaurant => {
                let restaurantCard = document.createElement('div')
                restaurantCard.classList.add('city-list__card', 'restaurant-card', "swiper-slide")
                
                restaurantCard.innerHTML = `                              
                                        <div class="restaurant-card__img">
                                            <img src="${restaurant.photos[0]}" alt="">
                                        </div>
                                        <div class="restaurant-card__title">${restaurant.name}</div>
                                        <button class="btn restaurant-card__btn with-angles" data-id="${restaurant.id}" target="" data-js="openRestaurantBtn">
                                            <span class="btn__text">смотреть</span>
                                            <span class="btn__icon">
                                                <svg>
                                                    <use xlink:href="./img/sprites/sprite.svg#btn_arrow"></use>
                                                </svg>
                                            </span>
                                        </button>
                                    `

                let restaurantsListWrap = restaurantsListEl.querySelector('.swiper-wrapper')
                restaurantsListWrap.appendChild(restaurantCard)
            })


            if(windowWidth > 767) {
                // формируем пагинацию
                const paginationContainer = document.querySelector('[data-js="paginationContainer"]')
                let pagesCount = Math.ceil(currentRestaurantFullList.length / cardsOnPage)
    
                if(paginationContainer && pagesCount > 1) {
                    setPagination(paginationContainer, pagesCount, currentPaginationId, 'city.html?city-id=' + currentCityId)
                }
            } else {
                //инициализируем слайдер
                const sliderPrev = restaurantsListEl.querySelector('[data-js="sliderControlPrev"]')
                const sliderNext = restaurantsListEl.querySelector('[data-js="sliderControlNext"]')
        
                const restaurantsListSlider = new Swiper(restaurantsListEl, {
                    slidesPerView: 1,
                    loop: true,
                    speed: 400,
                    spaceBetween: 20,
                    navigation: {
                        nextEl: sliderNext,
                        prevEl: sliderPrev,
                      },
                });

            }

            openRestauranModal(currentRestaurantList)

            // строим карту
            initMap(currentRestaurantFullList, currentCityObj);
        })
    }

    /* НАПОЛНЕНИЕ СТРАНИЦЫ РЕСТОРАНА */
    function restaurantPageBuild() {
        const restaurantPage = document.querySelector('[data-js="restaurantPage"]');

        if(!restaurantPage) return

        let currentPageParams = window.location.search.slice(1).split("&")
        let currentRestaurantParam = currentPageParams.find(item => /^rest-id=/.test(item));

        fetch(restaurantsListPath, {
            method: 'get'
        }).then(response => response.json()).then(json => {
            const citiesListArr = json
    
            let restaurantsListArr = citiesListArr.map(item => item.restaurants)
            restaurantsListArr = [].concat(...restaurantsListArr)
    
            let currentRestaurant = restaurantsListArr[0]
            
            if(currentRestaurantParam !== undefined) {
                currentRestaurant = restaurantsListArr.find(item => item.id == currentRestaurantParam.split("=")[1])
            }
    
            restaurantPage.querySelectorAll('[data-js="restaurantBack"]').forEach(item => {
                item.setAttribute('href', `city.html?city-id=${currentRestaurant.cityId}`)
            })
            restaurantPage.querySelector('[data-js="restaurantTitle"]').innerHTML = currentRestaurant.name
            restaurantPage.querySelector('[data-js="restaurantCity"]').innerHTML = citiesListArr.find(item => item.id == currentRestaurant.cityId).name
    
            let restaurantSlider = document.querySelector('[data-id="restaurantPhotosSlider"] .swiper-wrapper')
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
    
                menuItem.innerHTML = item
    
                restaurantMenu.appendChild(menuItem)
            })

            let menuSlider = document.querySelector('[data-id="dishPhotosSlider"] .swiper-wrapper')
            currentRestaurant.dishPhotos.forEach(item => {
                let slide = document.createElement('div')
                slide.classList.add('restaurant__slide', 'swiper-slide')
    
                slide.innerHTML = `
                                    <div class="restaurant__img">
                                        <img src=${item} alt="фото блюда">
                                    </div>
                                `
    
                menuSlider.appendChild(slide)
            })

            let addressListEl = restaurantPage.querySelector('[data-js="restaurantAddress"]')
            currentRestaurant.address.forEach(address => {
                let currentAddress = document.createElement('p')
                currentAddress.innerHTML = address
                addressListEl.appendChild(currentAddress)
            })

            restaurantPage.querySelector('[data-js="restaurantMode"]').innerHTML = currentRestaurant.mode
            restaurantPage.querySelector('[data-js="restaurantPhone"]').setAttribute('href', 'tel:' + currentRestaurant.phone.replace(/[^+\d]/g, ""))
            restaurantPage.querySelector('[data-js="restaurantPhone"]').innerHTML = currentRestaurant.phone

            let restaurantSiteList = restaurantPage.querySelector('[data-js="restaurantSites"]')
            currentRestaurant.site.forEach(currentSite => {
                let linkEl = document.createElement('a')
                linkEl.setAttribute('href', currentSite)
                linkEl.innerHTML = currentSite

                restaurantSiteList.appendChild(linkEl)
            })

            let restaurantSiteBtn = restaurantPage.querySelector('[data-js="restaurantSite"]')
            restaurantSiteBtn.setAttribute('href', currentRestaurant.site[0])
            restaurantSiteBtn.innerHTML = currentRestaurant.site[0]
        })

    }

    /* БИЛД СПИСКА КАТЕГОРИЙ РЕЦЕПТОВ */
    function recipeCategoriesListBuild() {
        const recipeCategoriesListEl = document.querySelector('[data-js="recipeCategoriesList"]')

        if(!recipeCategoriesListEl) return

        fetch(recipesListPath, {
            method: 'get'
        }).then(response => response.json()).then(json => {

            let recipeCategoriesListArr = json

            recipeCategoriesListArr.forEach(category => {
                let recipeCategoryCard = document.createElement('div')
                recipeCategoryCard.classList.add('recipe-categories__card', 'recipe-category')
    
                recipeCategoryCard.innerHTML = `                              
                                        <div class="recipe-category__img"><img src=${category.img} alt=""></div>
                                        <h2 class="title title--h2 recipe-category__title">${category.name}</h2>
                                        <a class="btn recipe-category__btn with-angles" href="recipes.html?category-id=${category.id}" target="">
                                            <span class="btn__text">смотреть</span>
                                            <span class="btn__icon">
                                                <svg>
                                                    <use xlink:href="./img/sprites/sprite.svg#btn_arrow"></use>
                                                </svg>
                                            </span>
                                        </a>
                                    `

                recipeCategoriesListEl.appendChild(recipeCategoryCard)
            })
        })
    }
    
    /* БИЛД СПИСКА РЕЦЕПТОВ В КАТЕГОРИИ */
    function recipesListBuild() {
        const recipesListEl = document.querySelector('[data-js="recipesList"]')

        if(!recipesListEl) return

        const cardsOnPage = 9

        let currentCategoryId = false
        let currentPaginationId = 0

        let currentPageParams = window.location.search.slice(1).split("&")
        let currentCategoryParam = currentPageParams.find(item => /^category-id=/.test(item));
        let currentPaginationParam = currentPageParams.find(item => /^pagination=/.test(item));

        if(currentCategoryParam !== undefined) {
            currentCategoryId = currentCategoryParam.split("=")[1]
        }

        if(currentPaginationParam !== undefined) {
            currentPaginationId = currentPaginationParam.split("=")[1]
        }

        fetch(recipesListPath, {
            method: 'get'
        }).then(response => response.json()).then(json => {

            let recipesListArr = json
            let currentCategoryObj = recipesListArr[0]

            if(currentCategoryId) {
                currentCategoryObj = recipesListArr.find(item => item.id == currentCategoryId) || recipesListArr[0]
            }

            
            // ищем нужные рецепты с учётом пагинации
            let currentRecipesFullList = currentCategoryObj.recipes
            let currentRecipesList = currentRecipesFullList
            
            if(windowWidth > 767) {
                currentRecipesList = currentRecipesFullList.slice(currentPaginationId * cardsOnPage, currentPaginationId * cardsOnPage + cardsOnPage)
            }


            //ставим название категории
            const categoryNameEl = document.querySelector('[data-js=categoryName]')
            if(categoryNameEl) {
                categoryNameEl.innerHTML = currentCategoryObj.name
            }

            // добавляем карточки ресторанов
            currentRecipesList.forEach(recipe => {
                let recipeCard = document.createElement('div')
                if(recipe.author == "chef") {
                    recipeCard.classList.add('recipes__card', 'recipe-card', "recipe-card--sticker", 'swiper-slide')
                } else {
                    recipeCard.classList.add('recipes__card', 'recipe-card', 'swiper-slide')
                }
                
                recipeCard.innerHTML = `                                          
                                    <div class="recipe-card__inner">
                                        <div class="recipe-card__img">
                                            <img src=${recipe.img} alt=""></div>
                                        <h2 class="title title--h2 recipe-card__title">${recipe.name}</h2>
                                        <div class="recipe-card__city">${recipe.city}</div>
                                        <a class="btn recipe-card__btn with-angles" href="recipe.html?recipe-id=${recipe.id}" target="">
                                            <span class="btn__text">узнать рецепт</span>
                                            <span class="btn__icon">
                                                <svg>
                                                    <use xlink:href="./img/sprites/sprite.svg#btn_arrow"></use>
                                                </svg>
                                            </span>
                                        </a>
                                    </div>
                                    `

                let recipesListWrap = recipesListEl.querySelector('.swiper-wrapper')
                recipesListWrap.appendChild(recipeCard)
            })

            if(windowWidth > 767) {
                // формируем пагинацию
                const paginationContainer = document.querySelector('[data-js="paginationContainer"]')
                let pagesCount = Math.ceil(currentRecipesFullList.length / cardsOnPage)

                if(paginationContainer && pagesCount > 1) {
                    setPagination(paginationContainer, pagesCount, currentPaginationId, 'recipes.html?category-id=' + currentCategoryId)
                }
            } else {
                //инициализируем слайдер
                const sliderPrev = recipesListEl.querySelector('[data-js="sliderControlPrev"]')
                const sliderNext = recipesListEl.querySelector('[data-js="sliderControlNext"]')
        
                const recipesListSlider = new Swiper(recipesListEl, {
                    slidesPerView: 1,
                    loop: true,
                    speed: 400,
                    spaceBetween: 20,
                    navigation: {
                        nextEl: sliderNext,
                        prevEl: sliderPrev,
                      },
                });

            }
        })

    }
    
    /* НАПОЛНЕНИЕ СТРАНИЦЫ РЕЦЕПТА */
    function recipePageBuild() {
        const recipePage = document.querySelector('[data-js="recipePage"]');

        if(!recipePage) return

        let currentPageParams = window.location.search.slice(1).split("&")
        let currentRecipeParam = currentPageParams.find(item => /^recipe-id=/.test(item));

        fetch(recipesListPath, {
            method: 'get'
        }).then(response => response.json()).then(json => {

            let recipesListArr = json.map(item => item.recipes)
            recipesListArr = [].concat(...recipesListArr)

            let currentRecipe = recipesListArr[0]
            
            if(currentRecipeParam !== undefined) {
                currentRecipe = recipesListArr.find(item => item.id == currentRecipeParam.split("=")[1])
            }

            if(currentRecipe.author == "chef") {
                recipePage.classList.add('recipe-page--chef')
            }

            recipePage.querySelectorAll('[data-js="recipeBack"]').forEach(item => {
                item.setAttribute('href', `recipes.html?category-id=${currentRecipe.categoryId}`)
            })

            let recipeHeaderRight = recipePage.querySelector('[data-js="recipeHeaderRight"]')
            if(currentRecipe.video.length > 1) {
                let videoIdList = currentRecipe.video.split("_")
                recipeHeaderRight.innerHTML = `
                                            <div class="m-intro__video">
                                                <iframe src="https://vk.com/video_ext.php?oid=-${videoIdList[0]}&id=${videoIdList[1]}&hd=1" width="640" height="360" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" frameborder="0" allowfullscreen></iframe>
                                            </div>
                                            `
            } else {
                recipeHeaderRight.innerHTML = `
                                            <div class="m-intro__title">
                                                ЗАВТРАК КАК ТРАДИЦИЯ, ЗАВТРАК КАК НАСТОЯЩИЙ ПРАЗДНИК
                                            </div>
                                            `
            }
            
            recipePage.querySelector('[data-js="recipeTitle"]').innerHTML = currentRecipe.name
            recipePage.querySelector('[data-js="chefPhoto"]').setAttribute('src', currentRecipe.chefPhoto)
            recipePage.querySelector('[data-js="dishPhoto"]').setAttribute('src', currentRecipe.dishPhoto)
            recipePage.querySelector('[data-js="recipeAuthorName"]').innerHTML = currentRecipe.authorName
            recipePage.querySelector('[data-js="recipeAuthorInfo"]').innerHTML = currentRecipe.authorInfo

            let recipeStickers = document.querySelector('[data-js="recipeStickers"]')

            if(currentRecipe.stickers.length > 0) {
                currentRecipe.stickers.forEach(item => {
                    let sticker = document.createElement('div')
                    sticker.classList.add('recipe__sticker', `recipe__sticker--${item.color}`)
        
                    sticker.innerHTML = item.text
        
                    recipeStickers.appendChild(sticker)
                })
            }

            recipePage.querySelector('[data-js="restaurantLogo"]').setAttribute('src', currentRecipe.restLogo)
            recipePage.querySelector('[data-js="recipeDesc"]').innerHTML = currentRecipe.desc
            recipePage.querySelector('[data-js="recipeCount"]').innerHTML = currentRecipe.count

            let recipeIngredients = document.querySelector('[data-js="recipeIngredients"]')

            currentRecipe.ingredients.forEach(item => {
                let subtitle = document.createElement('div') 
                subtitle.classList.add('recipe-ingredients__subtitle')
                subtitle.innerHTML = item.name

                let list = document.createElement('ul')
                list.classList.add('recipe-ingredients__list')
                
                item.list.forEach(listItem => {
                    let li = document.createElement('li')
                    
                    if(listItem.sponsor) {
                        li.classList.add("_sponsor")
                    }

                    li.innerHTML = listItem.text

                    list.appendChild(li)
                })

                recipeIngredients.appendChild(subtitle)
                recipeIngredients.appendChild(list)
            })

            recipePage.querySelector('[data-js="ingredientsPhoto"]').setAttribute('src', currentRecipe.ingredientsPhoto)
            recipePage.querySelector('[data-js="ingredientsLink"]').setAttribute('href', currentRecipe.ingredientsLink)

            let recipeProcess = document.querySelector('[data-js="recipeProcess"]')

            currentRecipe.process.forEach(item => {

                let subtitle = document.createElement('div') 
                subtitle.classList.add('recipe-process__subtitle')
                subtitle.innerHTML = item.name

                let list = document.createElement('ul')
                list.classList.add('recipe-process__list')
                
                item.list.forEach(listItem => {
                    let li = document.createElement('li')
                    li.innerHTML = listItem
                    list.appendChild(li)
                })

                recipeProcess.appendChild(subtitle)
                recipeProcess.appendChild(list)
            })

            recipePage.querySelector('[data-js="recipeNote"]').innerHTML = currentRecipe.note
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

            openRestauranModalById(modal, currentRestaurant)
        }
    })
}

/* УПРАВЛЕНИЕ СПОЙЛЕРАМИ */
function spoilerController() {
    const spoilers = document.querySelectorAll('[data-js="spoiler"]')

    if(spoilers.length < 1) return

    spoilers.forEach(spoiler => {
        const spoilerOpen = spoiler.querySelector('[data-js="spoilerOpen"]');
        const spoilerContent = spoiler.querySelector('[data-js="spoilerContent"]');

        $(spoilerOpen).on('click', function() {
            $(spoilerContent).show(400)
            $(spoilerOpen).hide(400)
        })
    })
}

/* НАПОЛНЕНИЕ И ОТКРЫТИЕ МОДАЛКИ РЕСТОРАНА ПО ID */
function openRestauranModalById(modal, currentRestaurant) {

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

/* НАПОЛНЕНИЕ И ОТКРЫТИЕ МОДАЛКИ ПОВАРА */
function openCookModal() {
    const homeCooksItems = document.querySelectorAll('[data-js="homeCooksItem"]')
    const modal = document.querySelector('[data-js="cookModal"]')

    if(homeCooksItems.length < 1 || !modal) return

    homeCooksItems.forEach(item => {
        item.addEventListener('click', () => {
            let targetCookCard = item

            let cookPhoto = targetCookCard.querySelector('[data-js="homeCooksPhoto"]').getAttribute('src')
            let cookName = targetCookCard.querySelector('[data-js="homeCooksName"]').innerHTML
            let cookText = targetCookCard.querySelector('[data-js="homeCooksText"]').innerHTML
            let cookCity = targetCookCard.querySelector('[data-js="homeCooksCity"]').innerHTML

            modal.querySelector('[data-js="cookModalPhoto"]').setAttribute('src', cookPhoto)
            modal.querySelector('[data-js="cookModalName"]').innerHTML = cookName
            modal.querySelector('[data-js="cookModalText"]').innerHTML = cookText
            modal.querySelector('[data-js="cookModalCity"]').innerHTML = cookCity

            modals.open(modal)
        })
    })
}