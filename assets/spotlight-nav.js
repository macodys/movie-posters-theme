// Exact CodePen Implementation with Tweakpane
import gsap from 'https://cdn.skypack.dev/gsap@3.12.0'
import { Pane } from 'https://cdn.skypack.dev/tweakpane@4.0.4'

const config = {
  theme: 'dark',
  spotlight: {
    speed: 0.25,
    deviation: 0.8,
    surface: 0.5,
    specular: 6,
    exponent: 65,
    light: 'hsla(234, 14%, 72%, 0.25)',
    x: 0,
    y: 54,
    z: 82,
    pointer: false,
  },
  ambience: {
    deviation: 0.8,
    surface: 0.5,
    specular: 25,
    exponent: 65,
    light: 'hsla(234, 14%, 72%, 0.25)',
    x: 120,
    y: -154,
    z: 160,
  },
}

const ctrl = new Pane({
  title: 'Config',
  expanded: true,
})

const nav = document.querySelector('nav')
const links = nav?.querySelectorAll('a')
const spotlightfeGaussianBlur = document.querySelector('#spotlight feGaussianBlur')
const spotlightfeSpecularLighting = document.querySelector('#spotlight feSpecularLighting')
const spotlightfePointLight = document.querySelector('#spotlight fePointLight')
const ambiencefeGaussianBlur = document.querySelector('#ambience feGaussianBlur')
const ambiencefeSpecularLighting = document.querySelector('#ambience feSpecularLighting')
const ambiencefePointLight = document.querySelector('#ambience fePointLight')

const syncLight = ({ x, y }) => {
  const navBounds = nav.getBoundingClientRect()
  spotlightfePointLight.setAttribute('x', Math.floor(x - navBounds.x))
  spotlightfePointLight.setAttribute('y', Math.floor(y - navBounds.y))
}

let monitoring = false

const update = () => {
  document.documentElement.dataset.theme = config.theme
  
  // set spotlight
  spotlightfeGaussianBlur.setAttribute('stdDeviation', config.spotlight.deviation)
  spotlightfeSpecularLighting.setAttribute('surfaceScale', config.spotlight.surface)
  spotlightfeSpecularLighting.setAttribute('specularConstant', config.spotlight.specular)
  spotlightfeSpecularLighting.setAttribute('specularExponent', config.spotlight.exponent)
  spotlightfeSpecularLighting.setAttribute('lighting-color', config.spotlight.light)
  
  // set ambience
  ambiencefeGaussianBlur.setAttribute('stdDeviation', config.ambience.deviation)
  ambiencefeSpecularLighting.setAttribute('surfaceScale', config.ambience.surface)
  ambiencefeSpecularLighting.setAttribute('specularConstant', config.ambience.specular)
  ambiencefeSpecularLighting.setAttribute('specularExponent', config.ambience.exponent)
  ambiencefeSpecularLighting.setAttribute('lighting-color', config.ambience.light)
  
  const anchor = document.querySelector('[data-active="true"]')
  const navBounds = nav.getBoundingClientRect()
  const anchorBounds = anchor.getBoundingClientRect()

  spotlightfePointLight.setAttribute(
    'x',
    anchorBounds.left - navBounds.left + anchorBounds.width * 0.5 + config.spotlight.x
  )
  spotlightfePointLight.setAttribute('y', config.spotlight.y)
  spotlightfePointLight.setAttribute('z', config.spotlight.z)

  ambiencefePointLight.setAttribute('x', config.ambience.x)
  ambiencefePointLight.setAttribute('y', config.ambience.y)
  ambiencefePointLight.setAttribute('z', config.ambience.z)

  if (config.spotlight.pointer && !monitoring) {
    monitoring = true
    nav.dataset.pointerLighting = true
    window.addEventListener('pointermove', syncLight)
  } else if (!config.spotlight.pointer) {
    monitoring = false
    nav.dataset.pointerLighting = false
    window.removeEventListener('pointermove', syncLight)
  }
}

const selectAnchor = (anchor) => {
  if (!config.spotlight.pointer) {
    const navBounds = nav.getBoundingClientRect()
    const anchorBounds = anchor.getBoundingClientRect()
    
    for (const link of links) {
      link.dataset.active = anchor === link
    }
    
    gsap.to(spotlightfePointLight, {
      duration: config.spotlight.speed,
      attr: {
        x: anchorBounds.left - navBounds.left + anchorBounds.width * 0.5 + config.spotlight.x,
      },
    })
  }
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'Theme'
  )
    return update()
  document.startViewTransition(() => update())
}

// Configuration Panel
const anchorLight = ctrl.addFolder({ title: 'spotlight', expanded: false })

anchorLight.addBinding(config.spotlight, 'speed', {
  min: 0.2,
  step: 0.1,
  max: 10,
  label: 'speed (s)',
})

const blur = anchorLight.addFolder({ title: 'feGaussianBlur' })
blur.addBinding(config.spotlight, 'deviation', {
  label: 'stdDeviation',
  min: 0,
  max: 10,
  step: 0.1,
})

const lighting = anchorLight.addFolder({ title: 'feSpecularLighting' })
lighting.addBinding(config.spotlight, 'light', {
  label: 'color',
})
lighting.addBinding(config.spotlight, 'surface', {
  label: 'surfaceScale',
  min: 0,
  max: 50,
  step: 0.1,
})
lighting.addBinding(config.spotlight, 'specular', {
  label: 'constant',
  min: 0,
  max: 25,
  step: 0.1,
})
lighting.addBinding(config.spotlight, 'exponent', {
  label: 'exponent',
  min: 0,
  max: 200,
  step: 0.1,
})

const point = anchorLight.addFolder({ title: 'fePointLight' })
point.addBinding(config.spotlight, 'x', {
  label: 'x offset',
  min: -100,
  max: 100,
  step: 1,
})
point.addBinding(config.spotlight, 'y', {
  label: 'y offset',
  min: -100,
  max: 100,
  step: 1,
})
point.addBinding(config.spotlight, 'z', {
  label: 'z',
  min: 0,
  max: 500,
  step: 1,
})
point.addBinding(config.spotlight, 'pointer', {
  label: 'pointer',
})

const ambientLight = ctrl.addFolder({ title: 'ambience', expanded: false })

const ambientblur = ambientLight.addFolder({ title: 'feGaussianBlur' })
ambientblur.addBinding(config.ambience, 'deviation', {
  label: 'stdDeviation',
  min: 0,
  max: 10,
  step: 0.1,
})

const ambientlighting = ambientLight.addFolder({ title: 'feSpecularLighting' })
ambientlighting.addBinding(config.ambience, 'light', {
  label: 'color',
})
ambientlighting.addBinding(config.ambience, 'surface', {
  label: 'surfaceScale',
  min: 0,
  max: 50,
  step: 0.1,
})
ambientlighting.addBinding(config.ambience, 'specular', {
  label: 'constant',
  min: 0,
  max: 25,
  step: 0.1,
})
ambientlighting.addBinding(config.ambience, 'exponent', {
  label: 'exponent',
  min: 0,
  max: 200,
  step: 0.1,
})

const ambientpoint = ambientLight.addFolder({ title: 'fePointLight' })
ambientpoint.addBinding(config.ambience, 'x', {
  label: 'x',
  min: -500,
  max: 500,
  step: 1,
})
ambientpoint.addBinding(config.ambience, 'y', {
  label: 'y',
  min: -500,
  max: 500,
  step: 1,
})
ambientpoint.addBinding(config.ambience, 'z', {
  label: 'z',
  min: 0,
  max: 500,
  step: 1,
})

ctrl.addBinding(config, 'theme', {
  label: 'Theme',
  options: {
    System: 'system',
    Light: 'light',
    Dark: 'dark',
  },
})

ctrl.on('change', sync)
update()

nav.addEventListener('click', (event) => {
  if (event.target.tagName === 'A') selectAnchor(event.target)
})