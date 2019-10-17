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
        setButtonLineRect(currentPosition = getMenuButtonFromSection(entries[0].target).getBoundingClientRect())
    }, {threshold: 0.25})

    observer.observe(document.querySelector('section'))

    $('.menu .button').hover(function() {
        clearTimeout(timeoutPosition)
        setButtonLineRect(this.getBoundingClientRect())
    }, () => { timeoutPosition = setTimeout(() => setButtonLineRect(currentPosition), 500) })
}

$(window).ready(() => {

    initMenu()
})
