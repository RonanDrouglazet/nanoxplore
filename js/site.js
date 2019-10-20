const setButtonLineRect = rect => $('.menu .button-line').css({
    left: rect.left,
    width: rect.width,
    top: rect.top + rect.height
})

const getMenuButtonFromSection = section =>
    $(`.menu .button[data-menu="${$(section).data('menu')}"]`).get(0)

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

    $('.menu .button').hover(function() {
        clearTimeout(timeoutPosition)
        setButtonLineRect(this.getBoundingClientRect())
    }, () => { timeoutPosition = setTimeout(() => setButtonLineRect(currentPosition()), 500) })

    $(window).on('resize', () => {
        clearTimeout(timeoutPosition)
        timeoutPosition = setTimeout(() => setButtonLineRect(currentPosition()), 1)
    })
}

$(window).ready(() => {
    initMenu()
})
