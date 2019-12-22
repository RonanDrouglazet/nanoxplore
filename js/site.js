const setButtonLineRect = rect => $('header .menu .button-line').css({
    left: rect.left,
    width: rect.width,
    top: rect.top + rect.height
})

const getMenuButtonFromSection = section =>
    $(`header .menu .button[data-menu="${$(section).data('menu')}"]`).get(0)

let currentPosition
let timeoutPosition

const initMenu = () => {
    const observed = []
    const getObserved = target => observed.find(_ => _.target === target) || observed.push({target})
    const getBiggest = () => observed.reduce((acc, curr) => !acc || curr.vheight > acc.vheight ? curr : acc)
    const observer = new IntersectionObserver(entries => {
        entries.filter(entry => entry.isIntersecting).forEach(entry => {
            getObserved(entry.target).vheight = entry.intersectionRect.height
            currentPosition = () => getMenuButtonFromSection(getBiggest().target).getBoundingClientRect()
            setButtonLineRect(currentPosition())
        })
    }, { threshold: new Array(100).fill(0).map((v, i) => i / 100)})

    document.querySelectorAll('section').forEach(section => observer.observe(section))
    observer.observe(document.querySelector('footer'))

    $('header .menu .button[data-menu]').hover(function() {
        clearTimeout(timeoutPosition)
        setButtonLineRect(this.getBoundingClientRect())
    }, () => { timeoutPosition = setTimeout(() => setButtonLineRect(currentPosition()), 500) })

    $('header .menu .button').click(function () {
        const position = $('section.' + $(this).data('menu')).offset().top - $('header').height()
        scrollTo(0, position)
    })

    $(window).on('resize', () => {
        clearTimeout(timeoutPosition)
        timeoutPosition = setTimeout(() => setButtonLineRect(currentPosition()), 1)
    })
}

const initMore = () => {
    $('.learn-more, .read-more').each(function() {
        const button = $(this)
        const sub = $('.sub-content.' + button.data('sub'))
        const padding = parseInt(sub.data('padding'), 10) || 0
        const height = () => Math.max(sub.find('.description.active').height(), sub.find('.menu').height()) + (padding * 2)
        let heightInterval

        button.click(() => {
            const active = sub.parent().find('.sub-content.active')
            if (active.length && active.get(0) != sub.get(0)) {
                active.css('height', 0)
                active.css('padding-top', 0)
                active.css('padding-bottom', 0)
                active.toggleClass('active')
            }
            const shouldClose = !!sub.height()
            sub.toggleClass('active')
            sub.css('height', shouldClose ? 0 : height() + 'px')
            sub.css('padding-top', shouldClose ? 0 : padding + 'px')
            sub.css('padding-bottom', shouldClose ? 0 : padding + 'px')

            if (location.href.match('/admin')) {
                if (shouldClose) {
                    clearInterval(heightInterval)
                } else {
                    heightInterval = setInterval(() => sub.css('height', height() + 'px'), 1000)
                }
            }
        })
    })
}

const initSub = () => {
    $('.sub-content').each(function() {
        const sub = $(this)
        sub.find('.menu button:not(.title)').each(function () {
            $(this).click(function () {
                const toShow = sub.find('.description.' + $(this).data('menu'))
                const current = sub.find('.description.active')
                const padding = parseInt(sub.data('padding'), 10) || 0
                const height = Math.max(toShow.height(), sub.find('.menu').height()) + (padding * 2)

                if (toShow !== current) {
                    current.toggleClass('active', 'out')
                    toShow.toggleClass('active')
                    sub.find(' .menu button.active').toggleClass('active')
                    $(this).toggleClass('active')
                    sub.css('height', height + 'px')
                }
            })
        })
    })
}

$(window).ready(() => {
    initMenu()
    initMore()
    initSub()
})

const sales = {
    "Europe": {
        "lat": 48.1015541,
        "lng": 4.1646157,
        "zoom": 4,
        "adress": [
            { "title": "EBV EMG Elektronische Bauelemente GmbH", "position": { "lat": 48.183285, "lng": 16.320322} },
            { "title": "EBV Europe Comm. VA", "position": { "lat": 50.887022, "lng": 4.456317 } }
        ]
    },
    "Middle East & Africa": {
        "lat": 35.4240095,
        "lng": 36.0826898,
        "zoom": 5,
        "adress": [
            { "title": "EBV EMG Elektronische Bauelemente GmbH", "position": { "lat": 48.1832562, "lng": 16.3181333} }
        ]
    },
    "Asia": {
        "lat": 20.9476615,
        "lng": 120,
        "zoom": 3,
        "adress": []
    },
    "Latin America": {
        "lat": -12.8502189,
        "lng": -74.5430881,
        "zoom": 3,
        "adress": []
    },
    "North America": {
        "lat": 38.6773198,
        "lng": -97.9922459,
        "zoom": 4,
        "adress": []
    }
}

window.initMap = () => {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: sales["Europe"],
        zoom: sales["Europe"].zoom,
        mapTypeControl: false
    })
    let markers = []

    const centerOn = continent => {
        markers.forEach(marker => marker.setMap(null))
        markers = continent.adress.map(sale => new google.maps.Marker({ ...sale, map }))

        /*new MarkerClusterer(map, markers,
            { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' })*/

        map.setCenter(continent)
        map.setZoom(continent.zoom)
    }

    for (continent in sales) {
        $('.gmap-container .menu')
            .append('<button data-menu="'+ continent +'">'+ continent +'<div class="arrow"></div></button>')
    }

    $('.gmap-container .menu button:not(.title)').click(function() {
        centerOn(sales[$(this).data('menu')])
        if (!sales[$(this).data('menu')].adress.length) {
            $('.gmap-container .coming').show().css('display', 'flex')
        } else {
            $('.gmap-container .coming').hide()
        }
    })

    centerOn(sales["Europe"])
}

window.ready = true
