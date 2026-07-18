import { useEffect, useState } from 'react'

const FIELD_NAMES = [
  'make',
  'model',
  'year',
  'mileage',
  'auction_grade',
  'auction_price',
  'estimated_import_cost',
  'estimated_selling_price',
]

const NUMERIC_FIELDS = new Set([
  'year',
  'mileage',
  'auction_price',
  'estimated_import_cost',
  'estimated_selling_price',
])

const labels = {
  make: 'Make',
  model: 'Model',
  year: 'Year',
  mileage: 'Mileage (km)',
  auction_grade: 'Auction grade',
  auction_price: 'Auction price',
  estimated_import_cost: 'Estimated import cost',
  estimated_selling_price: 'Estimated selling price',
}

const fieldGroups = [
  {
    title: 'Vehicle identity',
    description: 'Core details used to identify the auction vehicle.',
    fields: ['make', 'model', 'year', 'auction_grade'],
  },
  {
    title: 'Auction details',
    description: 'Mileage and purchase information from the auction record.',
    fields: ['mileage', 'auction_price'],
  },
  {
    title: 'Saved estimates',
    description: 'Optional values may be entered now or calculated later with Run Estimate.',
    fields: ['estimated_import_cost', 'estimated_selling_price'],
  },
]

/** Convert a vehicle record into controlled form string values. */
function createFormValues(vehicle = {}) {
  const sourceVehicle = vehicle ?? {}
  return FIELD_NAMES.reduce((values, field) => {
    values[field] = sourceVehicle[field] ?? ''
    return values
  }, {})
}

/** Create/edit form that sends only the backend's allowed vehicle fields. */
export default function VehicleForm({
  mode = 'create',
  initialVehicle = null,
  onSubmit,
  onCancel,
  loading = false,
  serverErrors = [],
}) {
  const [values, setValues] = useState(() => createFormValues(initialVehicle))
  const [clientErrors, setClientErrors] = useState({})
  const nextYear = new Date().getFullYear() + 1

  useEffect(() => {
    setValues(createFormValues(initialVehicle))
    setClientErrors({})
  }, [initialVehicle, mode])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setClientErrors((current) => ({ ...current, [name]: '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return

    const errors = {}
    const make = String(values.make).trim()
    const model = String(values.model).trim()
    const year = values.year === '' ? NaN : Number(values.year)

    if (!make) errors.make = 'Make is required.'
    if (!model) errors.model = 'Model is required.'
    if (!Number.isFinite(year)) errors.year = 'Year is required.'
    else if (year < 1990 || year > nextYear) errors.year = `Year must be between 1990 and ${nextYear}.`

    FIELD_NAMES.forEach((field) => {
      if (NUMERIC_FIELDS.has(field) && values[field] !== '') {
        const number = Number(values[field])
        if (!Number.isFinite(number)) errors[field] = `${labels[field]} must be a valid number.`
        else if (field !== 'year' && number < 0) errors[field] = `${labels[field]} cannot be negative.`
      }
    })

    if (Object.keys(errors).length > 0) {
      setClientErrors(errors)
      return
    }

    const payload = {}
    FIELD_NAMES.forEach((field) => {
      const rawValue = values[field]

      if (field === 'make' || field === 'model') {
        payload[field] = String(rawValue).trim()
      } else if (field === 'auction_grade') {
        const trimmed = String(rawValue).trim()
        if (trimmed) payload[field] = trimmed
        else if (mode === 'edit') payload[field] = null
      } else if (NUMERIC_FIELDS.has(field)) {
        if (rawValue !== '') payload[field] = Number(rawValue)
        else if (mode === 'edit' && field !== 'year') payload[field] = null
      }
    })

    await onSubmit(payload)
  }

  return (
    <form className="vehicle-form" onSubmit={handleSubmit} noValidate>
      {serverErrors.length > 0 && (
        <div className="form-server-errors" role="alert">
          <strong>Please correct the following:</strong>
          <ul>{serverErrors.map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}</ul>
        </div>
      )}

      {fieldGroups.map((group) => (
        <fieldset className="form-section" key={group.title}>
          <legend>{group.title}</legend>
          <p className="form-section__description">{group.description}</p>
          <div className="form-grid">
            {group.fields.map((field) => {
              const required = field === 'make' || field === 'model' || field === 'year'
              const numeric = NUMERIC_FIELDS.has(field)
              return (
                <div className="form-field" key={field}>
                  <label htmlFor={`vehicle-${field}`}>
                    {labels[field]} {required && <span aria-hidden="true">*</span>}
                  </label>
                  <input
                    id={`vehicle-${field}`}
                    name={field}
                    type={numeric ? 'number' : 'text'}
                    value={values[field]}
                    onChange={handleChange}
                    min={field === 'year' ? 1990 : numeric ? 0 : undefined}
                    max={field === 'year' ? nextYear : undefined}
                    step={field === 'year' || field === 'mileage' ? 1 : numeric ? 'any' : undefined}
                    required={required}
                    disabled={loading}
                    aria-invalid={Boolean(clientErrors[field])}
                    aria-describedby={clientErrors[field] ? `vehicle-${field}-error` : undefined}
                  />
                  {clientErrors[field] && <span className="field-error" id={`vehicle-${field}-error`}>{clientErrors[field]}</span>}
                </div>
              )
            })}
          </div>
        </fieldset>
      ))}

      <p className="form-footnote">Fields marked with * are required. Blank optional fields are omitted when creating a vehicle.</p>
      <div className="modal-actions">
        <button className="button button--secondary" type="button" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="button button--primary" type="submit" disabled={loading}>
          {loading ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create Vehicle'}
        </button>
      </div>
    </form>
  )
}
