const setButtonLineRect = rect =>
  $('header .menu .button-line').css({
    left: rect.left,
    width: rect.width,
    top: rect.top + rect.height,
  })

const getMenuButtonFromSection = section =>
  $(`header .menu .button[data-menu="${$(section).data('menu')}"]`).get(0)

let currentPosition
let timeoutPosition

const initMenu = () => {
  const observed = []
  const getObserved = target =>
    observed.find(_ => _.target === target) || observed.push({ target })
  const getBiggest = () =>
    observed.reduce((acc, curr) =>
      !acc || curr.vheight > acc.vheight ? curr : acc
    )
  const observer = new IntersectionObserver(
    entries => {
      entries
        .filter(entry => entry.isIntersecting)
        .forEach(entry => {
          getObserved(entry.target).vheight = entry.intersectionRect.height
          currentPosition = () =>
            getMenuButtonFromSection(
              getBiggest().target
            ).getBoundingClientRect()
          setButtonLineRect(currentPosition())
        })
    },
    { threshold: new Array(100).fill(0).map((v, i) => i / 100) }
  )

  document
    .querySelectorAll('section')
    .forEach(section => observer.observe(section))
  observer.observe(document.querySelector('footer'))

  $('header .menu .button[data-menu]').hover(
    function() {
      clearTimeout(timeoutPosition)
      setButtonLineRect(this.getBoundingClientRect())
    },
    () => {
      timeoutPosition = setTimeout(
        () => setButtonLineRect(currentPosition()),
        500
      )
    }
  )

  $('header .menu .button').click(function() {
    const position =
      $('section.' + $(this).data('menu')).offset().top - $('header').height()
    scrollTo(0, position)
  })

  $(window).on('resize', () => {
    clearTimeout(timeoutPosition)
    timeoutPosition = setTimeout(() => setButtonLineRect(currentPosition()), 1)
  })
}

const initMore = () => {
  $('.learn-more[data-sub], .read-more[data-sub]').each(function() {
    const button = $(this)
    const sub = $('.sub-content.' + button.data('sub'))
    const padding = parseInt(sub.data('padding'), 10) || 0
    const height = () =>
      Math.max(
        sub.find('.description.active').height(),
        sub.find('.menu').height()
      ) +
      padding * 2

    button.click(() => {
      const active = sub.parent().find('.sub-content.active')
      if (active.length && active.get(0) != sub.get(0)) {
        active.css('height', 0)
        active.css('padding-top', 0)
        active.css('padding-bottom', 0)
        active.toggleClass('active')
        clearInterval(active.get(0).heightInterval)
      }
      const shouldClose = !!sub.height()
      sub.toggleClass('active')
      sub.css('height', shouldClose ? 0 : height() + 'px')
      sub.css('padding-top', shouldClose ? 0 : padding + 'px')
      sub.css('padding-bottom', shouldClose ? 0 : padding + 'px')

      if (!shouldClose) {
        button.get(0).scrollIntoView()
      }

      if (location.href.match('/admin')) {
        if (shouldClose) {
          clearInterval(sub.get(0).heightInterval)
        } else {
          sub.get(0).heightInterval = setInterval(
            () => sub.css('height', height() + 'px'),
            1000
          )
        }
      }
    })
  })
}

const initSub = () => {
  $('.sub-content').each(function() {
    const sub = $(this)
    sub.find('.menu button:not(.title)').each(function(i) {
      if (i === 0) {
        $(this).addClass('active')
        $('.description.' + $(this).attr('data-menu')).addClass('active')
      }
      $(this).attr('data-sabo-clone', 'onClone')
      $(this).attr('data-sabo-remove', 'onRemove')
      $(this).off('click')
      $(this).click(function() {
        const toShow = sub.find('.description.' + $(this).data('menu'))
        const current = sub.find('.description.active')
        const padding = parseInt(sub.data('padding'), 10) || 0
        const height =
          Math.max(toShow.height(), sub.find('.menu').height()) + padding * 2

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

const initNews = () => {
  const newsContainer = $('.news-container')
  const newsButtons = $('.sub-content.news-details .menu button:not(.title)')
  const firstNews = $(`.description.${$(newsButtons[0]).data('menu')}`)
  const bigNews = `
  <div class="news big">
    <div class="image"><img src="${$(firstNews.find('img')[0]).attr(
      'src'
    )}"></div>
    <div class="description">
      <span>${$(firstNews.find('h3 span')[0]).html()}</span>
      <p>${$(firstNews.find('h2')[0]).html()}</p>
      <button class="read-more" data-sub="news-details">read more</button>
    </div>
  </div>
  `

  let otherNews = '<div class="news">'
  newsButtons.each((i, button) => {
    const desc = $(`.description.${$(button).data('menu')}`)
    if (i != 0) {
      otherNews += `
        <div class="little">
          <div class="image" style="background-image: url('${$(
            desc.find('img')[0]
          ).attr('src')}')"></div>
          <div class="description">
            <span>${$(desc.find('h3 span')[0]).html()}</span>
            <p>${$(desc.find('h2')[0]).html()}</p>
          </div>
        </div>
      `
    }
  })
  otherNews += '</div>'

  if (newsButtons.length > 1) {
    newsContainer.append(otherNews)
  }

  newsContainer.append(bigNews)
}

$(window).ready(() => {
  initMenu()
  initNews()
  initMore()
  initSub()
})

let map
let markers = []
let mapReady = false
let dataReady = false
let salesData
let openedInfo

window.initMap = () => {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 48.1015541,
      lng: 4.1646157,
    },
    zoom: 4,
    mapTypeControl: false,
  })
  mapReady = true
  if (dataReady) {
    loadMap(salesData)
  }
}

const loadSales = init => {
  $.get('./js/sales.json', json => {
    dataReady = true
    salesData = json
    if (mapReady && init) {
      loadMap(salesData)
    } else if (mapReady && !init) {
      centerOn(salesData['Europe'])
    }
  })
}

loadSales(true)

const centerOn = continent => {
  markers.forEach(marker => marker.setMap(null))
  markers = continent.adress.map(sale => {
    const marker = new google.maps.Marker({ ...sale, map })
    marker.addListener('click', () => {
      if (openedInfo) {
        openedInfo.close()
      }
      openedInfo = new google.maps.InfoWindow({
        content: `<h3>${sale.title}</h3><div>${sale.adress}</div>`,
      })
      openedInfo.open(map, marker)
    })
    return marker
  })
  /*new MarkerClusterer(map, markers,
            { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' })*/

  map.setCenter(continent)
  map.setZoom(continent.zoom)
}

const loadMap = data => {
  for (const continent in data) {
    $('.gmap-container .menu').append(
      '<button data-menu="' +
        continent +
        '">' +
        continent +
        '<div class="arrow"></div></button>'
    )
  }

  $('.gmap-container .menu button:not(.title)').click(function() {
    centerOn(data[$(this).data('menu')])
    if (!data[$(this).data('menu')].adress.length) {
      $('.gmap-container .coming')
        .show()
        .css('display', 'flex')
    } else {
      $('.gmap-container .coming').hide()
    }
  })

  centerOn(data['Europe'])
}

window.sabo_plugins = [
  {
    name: 'Gérer les revendeurs',
    icon: 'mdi-settings',
    type: 'json',
    json: 'js/sales.json',
    adress: {
      select: {
        label: 'Sélectionnez une région',
        items: [
          'Europe',
          'Middle East & Africa',
          'Asia',
          'Latin America',
          'North America',
        ],
      },
      textfield: {
        label: "Nom de l'adresse",
      },
    },
    // eslint-disable-next-line
    transformIn: json => {
      const data = []
      for (const continent in json) {
        data.push({
          id: continent,
          name: continent,
          children: json[continent].adress.map(_ => ({
            id: _.adress + _.title,
            name: _.title,
          })),
        })
      }
      return data
    },
    // eslint-disable-next-line
    getEdited: (json, edited) => {
      let element
      let region

      for (const r in json) {
        element =
          element ||
          ((region = r) &&
            json[r].adress.find(a => a.adress + a.title === edited.id))
      }

      return {
        adress: element.adress,
        textfield: element.title,
        position: element.position,
        select: region,
      }
    },
    // eslint-disable-next-line
    onSave: (json, newValue, oldValue) => {
      if (!oldValue) {
        json[newValue.select].adress.push({
          title: newValue.textfield,
          adress: newValue.adress,
          position: {
            lat: newValue.lat,
            lng: newValue.lng,
          },
        })
      } else {
        const element = json[oldValue.select].adress.find(
          a => a.title === oldValue.textfield && a.adress === oldValue.adress
        )
        element.title = newValue.textfield
        element.adress = newValue.adress
        element.position = {
          lat: newValue.lat,
          lng: newValue.lng,
        }
      }
      setTimeout(() => loadSales(), 1000)
      return json
    },
    // eslint-disable-next-line
    onRemove: (json, removed) => {
      for (const region in json) {
        json[region].adress = json[region].adress.filter(
          a => a.adress + a.title !== removed.id
        )
      }
      setTimeout(() => loadSales(), 1000)
      return json
    },
  },
  {
    name: 'Ajouter une news',
    icon: 'mdi-newspaper',
    type: 'exec',
    exec: () => onBeforeClone('news-details'),
  },
  {
    name: 'Ajouter un produit (software)',
    icon: 'mdi-microsoft',
    type: 'exec',
    exec: () => onBeforeClone('software'),
  },
  {
    name: 'Ajouter un produit (hardware)',
    icon: 'mdi-cpu-64-bit',
    type: 'exec',
    exec: () => onBeforeClone('fgpa'),
  },
]

const onBeforeClone = className => {
  const sub = document.querySelector('.sub-content.' + className)
  if (!sub.offsetHeight) {
    document.querySelector(`button[data-sub="${className}"]`).click()
  }

  //setTimeout(() => sub.scrollIntoView(), 500)

  const bt = sub.querySelector(`.menu button:not(.title)`)
  const clone = bt.cloneNode(true)
  bt.parentElement.insertBefore(clone, bt)
  return document.defaultView.onClone(clone, true)
}

window.onClone = (clonedElement, useTemplate) => {
  const id = (Date.now() * Math.random()).toString().replace('.', '')
  const oldDescClass = clonedElement.getAttribute('data-menu')
  clonedElement.innerHTML = 'Votre titre<div class="arrow"></div>'
  clonedElement.setAttribute('data-menu', id)
  if (clonedElement.classList.contains('active')) {
    Array.from(
      clonedElement.parentElement.getElementsByClassName('active')
    ).forEach(_ => _.classList.remove('active'))
    clonedElement.classList.add('active')
  }
  const grandpa = clonedElement.parentElement.parentElement.parentElement
  const template =
    (useTemplate &&
      grandpa.getElementsByClassName('description template')[0]) ||
    grandpa.getElementsByClassName(oldDescClass)[0]
  const newDesc = template.cloneNode(true)
  newDesc.className = 'description ' + id
  template.parentElement.appendChild(newDesc)
  initSub()
  clonedElement.click()
  return {
    addedNodes: useTemplate ? [clonedElement, newDesc] : [newDesc],
  }
}

window.onRemove = removedElement => {
  const toRemove = removedElement.parentElement.parentElement.parentElement.getElementsByClassName(
    removedElement.getAttribute('data-menu')
  )[0]
  const parent = removedElement.parentElement
  setTimeout(() => {
    parent.querySelector('.menu button:not(.title)').click()
  }, 100)
  return {
    removedNodes: [toRemove],
  }
}

window.sabo_elements = () => [...$('.member').get(), ...$('.title-line').get()]

window.ready = true
