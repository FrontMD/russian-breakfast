function headerControllInit() {
    const header = $('[data-js="header"]');

    //анимация при скролее
    const initScroll = $(window).scrollTop();
    let oldScrollY = initScroll;

    if(initScroll > 30) {
        header.addClass("header--small");
    }

    $(window).scroll(function() {
        const scroll = $(window).scrollTop();

        if(scroll > oldScrollY && scroll > 30) {
            header.addClass("header--small");
        } else {
            header.removeClass("header--small");
        }

        oldScrollY = scroll

    });

    //мобильное меню 
    const headerBurger = header.find('[data-js="headerBurger"]');

    if(headerBurger) {
        headerBurger.on('click', () => {
            header.toggleClass('isOpen')
        })
    }

}