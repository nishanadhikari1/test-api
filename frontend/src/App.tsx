import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)
  if(count==0)
  setCount(3)

  return (
    <>
    Hello
    </>
  )
}

export default App
