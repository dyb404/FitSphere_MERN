import '../cssfiles/pricing.css'
function Pricing() {
  const plans = [
    {
      name: 'Basic',
      price: 'PKR 3499',
      period: '/month',
      features: [
        'Access to health tips',
        'Basic workout plans',
        'Progress tracking',
        'Email support'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: 'PKR 6499',
      period: '/month',
      features: [
        'Everything in Basic',
        'Personal trainer assignment',
        'Custom workout plans',
        'Priority support',
        'Progress analytics'
      ],
      popular: true
    },
    {
      name: 'Premium',
      price: 'PKR 9999',
      period: '/month',
      features: [
        'Everything in Pro',
        '1-on-1 training sessions',
        'Nutrition guidance',
        '24/7 support',
        'Advanced analytics',
        'Workout scheduling'
      ],
      popular: false
    }
  ]

  return (
    <div className="pricing-page">
      <div className="container">
        <div className="pricing-header">
          <h1>Choose Your Plan</h1>
          <p>Select the perfect plan for your fitness journey</p>
        </div>

        <div className="pricingdiv">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h3 className='program-title'>{plan.name}</h3>
              <div className="pricing-price">
                <span className="price">{plan.price}</span>
                <span className="period">{plan.period}</span>
              </div>
              <ul className="pricing-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="check-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="pricing-btns">
                {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Pricing

