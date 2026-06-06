// Hidden slide-renderer route: /slides/:thesisId/:slideNumber
// Rendered headlessly by Puppeteer (scripts/capture_slides.js), which injects the thesis
// payload as window.__SLIDE_DATA__ before any script runs. We render the requested slide at
// exactly 1280x720 and add `slide-ready` to <body> once painted so Puppeteer can screenshot.
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Slide1Cover from '../slides/Slide1Cover.jsx'
import Slide2Snapshot from '../slides/Slide2Snapshot.jsx'
import Slide3Thesis from '../slides/Slide3Thesis.jsx'
import Slide4Financials from '../slides/Slide4Financials.jsx'
import Slide5Valuation from '../slides/Slide5Valuation.jsx'
import Slide6Technicals from '../slides/Slide6Technicals.jsx'
import Slide7Risks from '../slides/Slide7Risks.jsx'
import Slide8Closing from '../slides/Slide8Closing.jsx'
import { SLIDE_W, SLIDE_H } from '../slides/_shared'

const SLIDES = {
  1: Slide1Cover, 2: Slide2Snapshot, 3: Slide3Thesis, 4: Slide4Financials,
  5: Slide5Valuation, 6: Slide6Technicals, 7: Slide7Risks, 8: Slide8Closing,
}

export default function Slides() {
  const { slideNumber } = useParams()
  const n = parseInt(slideNumber, 10)
  const Comp = SLIDES[n]
  const data = (typeof window !== 'undefined' && window.__SLIDE_DATA__) || {}

  useEffect(() => {
    // Give charts (Recharts) a moment to paint, then signal readiness for capture.
    const raf = requestAnimationFrame(() => {
      setTimeout(() => document.body.classList.add('slide-ready'), 700)
    })
    return () => cancelAnimationFrame(raf)
  }, [n])

  return (
    <div style={{ width: SLIDE_W, height: SLIDE_H, overflow: 'hidden' }}>
      {Comp ? <Comp data={data} /> : <div>Unknown slide {slideNumber}</div>}
    </div>
  )
}
