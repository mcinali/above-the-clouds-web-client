import React, { useEffect } from "react";

export default function Error(){
  useEffect(() => {
    document.title = 'Above the Clouds'
  }, [])
  
  return (
    <div>{'Oops! Something went wrong.'}</div>
  )
}
