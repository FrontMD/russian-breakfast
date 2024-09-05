function headerControllInit() {
    const header = $('[data-js="header"]');
    const initScroll = $(window).scrollTop();
    let oldScrollY = initScroll;

    if(initScroll > 30) {
        header.addClass("header--small");
    }

    $(window).scroll(function() {
        const scroll = $(window).scrollTop();

        if(scroll > oldScrollY) {
            header.addClass("header--small");
        } else {
            header.removeClass("header--small");
        }

        oldScrollY = scroll

    });
}