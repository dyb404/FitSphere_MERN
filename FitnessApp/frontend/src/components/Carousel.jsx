import { useState, useEffect } from 'react'
import '../cssfiles/carousel.css'
const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
    title: ['Transform Your ', <span className="highlight">Body</span>],
    subtitle: 'Achieve your fitness goals with personalized training'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&q=80',
    title: ['Expert',<span className ="highlight"> Trainers</span> ],
    subtitle: 'Work with certified professionals who care about your success'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1920&q=80',
    title: ['Track Your', <span className='highlight'> Progress</span>],
    subtitle: 'Monitor your journey and celebrate every milestone'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80',
    title: ['Stay', <span className='highlight'> Healthy</span>],
    subtitle: 'Get expert health tips and nutrition advice'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920&q=80',
    title: ['Join', <span className='highlight'> FitSphere Today</span>],
    subtitle: 'Start your fitness journey with us'
  }
]

function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isPaused])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div
      className="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="carousel-slides">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="carousel-overlay">
              <div className="carousel-content">
                <h2>{slide.title}</h2>
                <p>{slide.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="carousel-btn carousel-btn-prev" onClick={prevSlide} aria-label="Previous slide">
        &#8249;
      </button>
      <button className="carousel-btn carousel-btn-next" onClick={nextSlide} aria-label="Next slide">
        &#8250;
      </button>

      <div className="carousel-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default Carousel

