const modals = new HystModal({
    linkAttributeName: "data-modal"
});

function openRestauranModal() {
    const restaurantList = document.querySelector('[data-js="restaurantList"]')
    
    if(!restaurantList) return

    restaurantList.addEventListener("click", e => {
        if(e.target.closest('[data-js="openRestaurantBtn"]')) {
            modals.open('[data-js="restaurantModal"]')
        }
    })
}
