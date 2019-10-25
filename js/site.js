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
            currentPosition = () => getMenuButtonFromSection(entry.target).getBoundingClientRect()
            setButtonLineRect(currentPosition())
        })
    }, {threshold: 0.5})

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
        const sub = button.parent().find('.sub-content')
        const height = () => sub.find('.description.active').height()

        button.click(() => sub.css('height', sub.height() ? 0 : height() + 'px'))
    })
}

const initSub = () => {
    $('.sub-content .menu button:not(.title').each(function() {
        $(this).click(function() {
            const toShow = $('.sub-content .description.' + $(this).data('menu'))
            const current = $('.sub-content .description.active')
            const height = Math.max(toShow.height(), $('.sub-content .menu').height())

            if (toShow !== current) {
                current.toggleClass('active', 'out')
                toShow.toggleClass('active')
                $('.sub-content .menu button.active').toggleClass('active')
                $(this).toggleClass('active')
                $('.sub-content').css('height', height + 'px')
            }
        })
    })
}

$(window).ready(() => {
    initMenu()
    initMore()
    initSub()
})
