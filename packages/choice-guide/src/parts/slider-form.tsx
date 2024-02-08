import { Slider, Spacer } from '@openstad-headless/ui/src'
import React, { useEffect } from 'react'
import '../choice-guide.css';



export default function SliderForm({onChoiceChanged, choice, titlePreference, titleNoPreference} : {onChoiceChanged:(nr: number) => void, choice:any, titlePreference: string, titleNoPreference: string}) {
  const [value, setValue] = React.useState(50)

  useEffect(() => {
    onChoiceChanged && onChoiceChanged(value);
  },[value])
  
  return (
    <div className="choice-guide-resource-container">
      <h5>{choice.vraag}</h5>
      <Spacer size={2}/>
      <h6>A. {choice.optie1}</h6>
      <p className="choice-guide-text">{choice.optie1Beschrijving}</p>
      <h6>B. {choice.optie2}</h6>
      <p className="choice-guide-text">{choice.optie2Beschrijving}</p>
      {value < 50 ? <p>{titlePreference} {choice.optie1}</p> : null}
      {value === 50 ? <p>{titleNoPreference}</p> : null}
      {value > 50 ? <p>{titlePreference} {choice.optie2}</p> : null}
      <Slider onValueChange={setValue}/>
    </div>
  )
}