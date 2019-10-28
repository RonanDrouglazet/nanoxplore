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

    const observer = new IntersectionObserver(entries => {
        entries.filter(entry => entry.isIntersecting).forEach(entry => {
            console.log(entry.target, entry.intersectionRatio)
            currentPosition = () => getMenuButtonFromSection(entry.target).getBoundingClientRect()
            setButtonLineRect(currentPosition())
        })
    }, {threshold: 0.25})

    document.querySelectorAll('section').forEach(section => observer.observe(section))
    observer.observe(document.querySelector('footer'))

    $('header .menu .button').hover(function() {
        clearTimeout(timeoutPosition)
        setButtonLineRect(this.getBoundingClientRect())
    }, () => { timeoutPosition = setTimeout(() => setButtonLineRect(currentPosition()), 500) })

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
        const height = () => sub.find('.description.active').height() + padding

        button.click(() => {
            const active = sub.parent().find('.sub-content.active')
            if (active.length && active.get(0) != sub.get(0)) {
                active.css('height', 0)
                active.css('padding-top', 0)
                active.toggleClass('active')
            }
            const shouldClose = !!sub.height()
            sub.toggleClass('active')
            sub.css('height', shouldClose ? 0 : height() + 'px')
            sub.css('padding-top', shouldClose ? 0 : padding + 'px')
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
                const height = Math.max(toShow.height() + padding, sub.find('.menu').height())

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
