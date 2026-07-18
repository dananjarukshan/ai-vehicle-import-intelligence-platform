import { useState } from 'react'

const estimateFields = [
  { name: 'exchange_rate', label: 'Exchange rate', hint: 'Must be greater than zero when provided.' },
  { name: 'freight_cost', label: 'Freight cost' },
  { name: 'insurance_cost', label: 'Insurance cost' },
  { name: 'clearance_cost', label: 'Clearance cost' },
  { name: 'duty_rate', label: 'Duty rate', hint: 'Enter as a decimal: 0.18 means 18%.' },
  { name: 'vat_rate', label: 'VAT rate', hint: 'Enter as a decimal: 0.18 means 18%.' },
  { name: 'profit_margin_rate', label: 'Profit margin rate', hint: 'Enter as a decimal: 0.18 means 18%.' },
  { name: 'other_costs', label: 'Other costs' },
]

const estimateFieldGroups = [
  {
    title: 'Conversion and landing costs',
    description: 'Leave fields blank to use the backend calculation defaults.',
    fields: ['exchange_rate', 'freight_cost', 'insurance_cost', 'clearance_cost', 'other_costs'],
  },
  {
    title: 'Rates and profitability',
    description: 'Enter rates as decimals; for example, 0.18 represents 18%.',
    fields: ['duty_rate', 'vat_rate', 'profit_margin_rate'],
  },
]

const initialValues = estimateFields.reduce((values, field) => ({ ...values, [field.name]: '' }), {})

/** Format one calculation result without assuming a currency. */
function formatResult(value) {
  if (value === null || value === undefined) return '—'
  const number = Number(value)
  return Number.isFinite(number) ? number.toLocaleString() : String(value)
}

/** Optional inputs and calculation results for formula-based price estimation. */
export default function EstimateForm({ vehicle, onSubmit, onCancel, loading = false, serverErrors = [], result = null }) {
  const [values, setValues] = useState(initialValues)
  const [clientErrors, setClientErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setClientErrors((current) => ({ ...current, [name]: '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return

    const errors = {}
    const payload = {}

    estimateFields.forEach(({ name, label }) => {
      const rawValue = values[name]
      if (rawValue === '') return
      const number = Number(rawValue)
      if (!Number.isFinite(number)) errors[name] = `${label} must be a valid number.`
      else if (name === 'exchange_rate' && number <= 0) errors[name] = 'Exchange rate must be greater than zero.'
      else if (number < 0) errors[name] = `${label} cannot be negative.`
      else payload[name] = number
    })

    if (Object.keys(errors).length > 0) {
      setClientErrors(errors)
      return
    }

    await onSubmit(payload)
  }

  const breakdown = result?.meta
  const updatedVehicle = result?.data

  return (
    <form className="estimate-form" onSubmit={handleSubmit} noValidate>
      <div className="estimate-vehicle-summary">
        <div>
          <span>Vehicle</span>
          <strong>{vehicle.make} {vehicle.model}</strong>
        </div>
        <div>
          <span>Auction price</span>
          <strong>{formatResult(vehicle.auction_price)}</strong>
        </div>
      </div>

      {serverErrors.length > 0 && (
        <div className="form-server-errors" role="alert">
          <strong>Estimation could not be completed:</strong>
          <ul>{serverErrors.map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}</ul>
        </div>
      )}

      {estimateFieldGroups.map((group) => (
        <fieldset className="form-section" key={group.title}>
          <legend>{group.title}</legend>
          <p className="form-section__description">{group.description}</p>
          <div className="form-grid">
            {group.fields.map((name) => {
              const { label, hint } = estimateFields.find((field) => field.name === name)
              return (
                <div className="form-field" key={name}>
                  <label htmlFor={`estimate-${name}`}>{label}</label>
                  <input
                    id={`estimate-${name}`}
                    name={name}
                    type="number"
                    min={name === 'exchange_rate' ? '0.000001' : 0}
                    step="any"
                    value={values[name]}
                    onChange={handleChange}
                    disabled={loading}
                    aria-invalid={Boolean(clientErrors[name])}
                    aria-describedby={clientErrors[name] || hint ? `estimate-${name}-help` : undefined}
                  />
                  {(clientErrors[name] || hint) && (
                    <span className={clientErrors[name] ? 'field-error' : 'field-hint'} id={`estimate-${name}-help`}>
                      {clientErrors[name] || hint}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </fieldset>
      ))}

      {breakdown && updatedVehicle && (
        <section className="estimate-summary" aria-live="polite">
          <div className="estimate-summary__heading">
            <div><span aria-hidden="true">✓</span><strong>Estimate calculated</strong></div>
            <p>The updated values have been saved to this vehicle.</p>
          </div>
          <dl>
            <div><dt>Estimated import cost</dt><dd>{formatResult(updatedVehicle.estimated_import_cost)}</dd></div>
            <div><dt>Estimated selling price</dt><dd>{formatResult(updatedVehicle.estimated_selling_price)}</dd></div>
            <div><dt>Auction price local</dt><dd>{formatResult(breakdown.auction_price_local)}</dd></div>
            <div><dt>Base import cost</dt><dd>{formatResult(breakdown.base_import_cost)}</dd></div>
            <div><dt>Duty amount</dt><dd>{formatResult(breakdown.duty_amount)}</dd></div>
            <div><dt>VAT amount</dt><dd>{formatResult(breakdown.vat_amount)}</dd></div>
            <div><dt>Profit amount</dt><dd>{formatResult(breakdown.profit_amount)}</dd></div>
          </dl>
        </section>
      )}

      <div className="modal-actions">
        <button className="button button--secondary" type="button" onClick={onCancel} disabled={loading}>
          {result ? 'Close' : 'Cancel'}
        </button>
        <button className="button button--primary" type="submit" disabled={loading}>
          {loading ? 'Calculating…' : 'Run Estimate'}
        </button>
      </div>
    </form>
  )
}
