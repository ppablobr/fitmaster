import React from 'react'
    import { render, screen } from '@testing-library/react'
    import App from '../App'
    import { BrowserRouter } from 'react-router-dom'

    describe('App Component', () => {
      it('renders the Home component', () => {
        render(
          <BrowserRouter>
            <App />
          </BrowserRouter>
        )
        expect(screen.getByText(/Track Your Fitness Journey/i)).toBeInTheDocument()
      })
    })
