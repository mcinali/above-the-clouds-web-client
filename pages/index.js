import React, { useEffect } from "react";

export default function Home(){
  useEffect(() => {
    document.title = 'Above the Clouds'
  }, [])
  
  return (
    <div>{'Uh oh, you got a problem!'}</div>
  )
}
