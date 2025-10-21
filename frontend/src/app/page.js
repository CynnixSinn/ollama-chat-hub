import dynamic from 'next/dynamic'

// Dynamically import the App component to avoid SSR issues with socket.io
const App = dynamic(() => import('../pages/App'), {
  ssr: false
})

export default function HomePage() {
  return <App />
}