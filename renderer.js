// —— Fördelningsbar ——
function onPctChange(changed) {
  const w = parseFloat(document.getElementById('pct-white').value) || 0
  const ro = parseFloat(document.getElementById('pct-rose').value)  || 0
  const r = parseFloat(document.getElementById('pct-red').value)   || 0
  updateBar(w, ro, r)
}

function updateBar(w, ro, r) {
  const total = w + ro + r
  document.getElementById('bar-white').style.width = total > 0 ? (w  / total * 100) + '%' : '0%'
  document.getElementById('bar-rose').style.width  = total > 0 ? (ro / total * 100) + '%' : '0%'
  document.getElementById('bar-red').style.width   = total > 0 ? (r  / total * 100) + '%' : '0%'
}

// Init bar
updateBar(40, 35, 25)

// —— Öl toggle ——
function toggleBeer() {
  const enabled = document.getElementById('beer-enabled').checked
  const inputs  = document.getElementById('beer-inputs')
  inputs.classList.toggle('disabled-section', !enabled)
}

// —— Beräkna ——
function calculate() {
  const guests    = parseFloat(document.getElementById('guests').value)
  const duration  = parseFloat(document.getElementById('duration').value)
  const pace      = parseFloat(document.getElementById('pace').value)
  const glassSize = parseFloat(document.getElementById('glasssize').value)
  const pctWhite  = parseFloat(document.getElementById('pct-white').value) || 0
  const pctRose   = parseFloat(document.getElementById('pct-rose').value)  || 0
  const pctRed    = parseFloat(document.getElementById('pct-red').value)   || 0
  const pctTotal  = pctWhite + pctRose + pctRed

  const sparklingGlasses   = parseFloat(document.getElementById('sparkling-glasses').value)
  const sparklingGlassSize  = parseFloat(document.getElementById('sparkling-glasssize').value)
  const priceWhite          = parseFloat(document.getElementById('price-white').value)
  const priceRose           = parseFloat(document.getElementById('price-rose').value)
  const priceRed            = parseFloat(document.getElementById('price-red').value)
  const priceSparkling      = parseFloat(document.getElementById('price-sparkling').value)
  const beerEnabled         = document.getElementById('beer-enabled').checked
  const beerPerPerson       = parseFloat(document.getElementById('beer-per-person').value)
  const beerCl              = parseFloat(document.getElementById('beer-cl').value)
  const priceBeer           = parseFloat(document.getElementById('price-beer').value)

  // Validering
  if (isNaN(guests) || guests < 1) {
    highlight('guests')
    return
  }
  if (isNaN(duration) || duration <= 0) { highlight('duration'); return }
  if (isNaN(pace)     || pace     <= 0) { highlight('pace');     return }
  if (isNaN(glassSize)|| glassSize<= 0) { highlight('glasssize');return }

  const pctError = document.getElementById('pct-error')
  if (Math.round(pctTotal) !== 100) {
    pctError.classList.remove('hidden')
    return
  }
  pctError.classList.add('hidden')

  // —— Räkna: mousserande (fast per kväll) ——
  const sparklingClPerPerson    = (isNaN(sparklingGlasses) || sparklingGlasses < 0 ? 0 : sparklingGlasses) *
                                   (isNaN(sparklingGlassSize) || sparklingGlassSize <= 0 ? 15 : sparklingGlassSize)
  const sparklingLiterTotal     = sparklingClPerPerson / 100 * guests
  const sparklingBottlesTotal   = Math.ceil(sparklingLiterTotal / 0.75)

  // —— Räkna: vin (tempo-baserat) ——
  const glassesPerPerson  = pace * duration                         // glas/person
  const clPerPerson       = glassesPerPerson * glassSize            // cl/person
  const literPerPerson    = clPerPerson / 100                       // liter/person
  const bottlesPerPerson  = literPerPerson / 0.75                   // fl/person

  const totalLiter        = literPerPerson * guests                 // liter totalt
  const totalBottles      = totalLiter / 0.75                       // fl totalt

  const literWhite        = totalLiter * (pctWhite / 100)
  const literRose         = totalLiter * (pctRose  / 100)
  const literRed          = totalLiter * (pctRed   / 100)

  const bottlesWhite      = Math.ceil(literWhite / 0.75)
  const bottlesRose       = Math.ceil(literRose  / 0.75)
  const bottlesRed        = Math.ceil(literRed   / 0.75)

  // —— Visa ——
  document.getElementById('results-summary').textContent =
    `${guests} gäster — ${duration} tim. — ${pace} glas/tim. — ${glassSize} cl/glas`

  document.getElementById('r-glasses').textContent    = fmt(glassesPerPerson) + ' glas'
  document.getElementById('r-cl').textContent         = fmt(clPerPerson)     + ' cl'
  document.getElementById('r-liter').textContent      = fmt(literPerPerson)  + ' liter'
  document.getElementById('r-bottles-pp').textContent = fmt(bottlesPerPerson) + ' fl'

  document.getElementById('r-guests-label').textContent  = guests
  document.getElementById('r-total-liter').textContent   = fmt(totalLiter)   + ' liter'
  document.getElementById('r-total-bottles').textContent = fmt(totalBottles) + ' fl (≈' + Math.ceil(totalBottles) + ' st)'

  // —— Kostnader: hjälpfunktion ——
  let totalCost = 0
  let anyPrice = false

  function showCost(elId, bottles, price) {
    const el = document.getElementById(elId)
    if (!isNaN(price) && price > 0) {
      const cost = bottles * price
      el.textContent = '≈ ' + fmtKr(cost) + ' kr (' + fmtKr(price) + ' kr/st)'
      el.classList.remove('hidden')
      totalCost += cost
      anyPrice = true
    } else {
      el.classList.add('hidden')
    }
  }

  // —— Räkna & visa: öl ——
  const beerCard = document.getElementById('r-beer-card')
  if (beerEnabled && !isNaN(beerPerPerson) && beerPerPerson > 0) {
    const beerTotalUnits = Math.ceil(beerPerPerson * guests)
    const beerLiter      = (beerPerPerson * (isNaN(beerCl) || beerCl <= 0 ? 33 : beerCl) / 100) * guests
    document.getElementById('r-beer').textContent =
      beerTotalUnits + ' st (' + fmt(beerLiter) + ' liter — ' +
      fmt(beerPerPerson) + ' st/pers.)'
    beerCard.classList.remove('hidden')
    showCost('r-beer-cost', beerTotalUnits, priceBeer)
  } else {
    beerCard.classList.add('hidden')
    document.getElementById('r-beer-cost').classList.add('hidden')
  }

  document.getElementById('r-sparkling').textContent =
    sparklingBottlesTotal + ' flaskor (' + fmt(sparklingLiterTotal) + ' liter — ' +
    fmt(sparklingClPerPerson) + ' cl/pers.)'

  document.getElementById('r-white').textContent = bottlesWhite + ' flaskor (' + fmt(literWhite) + ' liter)'
  document.getElementById('r-rose').textContent  = bottlesRose  + ' flaskor (' + fmt(literRose)  + ' liter)'
  document.getElementById('r-red').textContent   = bottlesRed   + ' flaskor (' + fmt(literRed)   + ' liter)'

  showCost('r-sparkling-cost', sparklingBottlesTotal, priceSparkling)
  showCost('r-white-cost',     bottlesWhite,          priceWhite)
  showCost('r-rose-cost',      bottlesRose,            priceRose)
  showCost('r-red-cost',       bottlesRed,             priceRed)

  const costRow = document.getElementById('r-total-cost-row')
  if (anyPrice) {
    document.getElementById('r-total-cost').textContent = fmtKr(totalCost) + ' kr'
    costRow.classList.remove('hidden')
  } else {
    costRow.classList.add('hidden')
  }

  const sec = document.getElementById('results-section')
  sec.classList.remove('hidden')
  sec.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Hjälpfunktioner
function fmt(n) {
  return +n.toFixed(1)
}

function fmtKr(n) {
  return Math.round(n).toLocaleString('sv-SE')
}

function highlight(id) {
  const el = document.getElementById(id)
  el.focus()
  el.style.outline = '2px solid #ef4444'
  setTimeout(() => el.style.outline = '', 1500)
}
