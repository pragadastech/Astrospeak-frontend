import { useEffect, useState } from 'react'
import { api } from '../api'
import Nav from '../components/Nav'
import PlanGrid from '../components/PlanGrid'

export default function Pricing() {
  const [data, setData] = useState({ plans: [], businessState: '' })
  const [user, setUser] = useState(null)
  useEffect(() => {
    api('/api/plans').then(setData).catch(() => {})
    api('/api/auth/me').then(setUser).catch(() => {})
  }, [])
  return (
    <>
      <Nav user={user} />
      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="tag">Pricing</span>
            <h2>Expert guidance</h2>
            <p>Vedic astrology, daily wishes and expert guidance. Choose India or the United States. Indian totals include 18% GST{data.businessState ? `, split inside ${data.businessState}` : ''}.</p>
          </div>
          <PlanGrid plans={data.plans || []} />
        </div>
      </section>
      <footer>
        <div className="wrap footer-content">
          <p>© {new Date().getFullYear()} AstroGreet · Vedic astrology, daily wishes & expert guidance.</p>
          <p className="footer-credit">Powered by Amrutha Varahi Universal Solutions Pvt. Ltd.</p>
        </div>
      </footer>
    </>
  )
}
