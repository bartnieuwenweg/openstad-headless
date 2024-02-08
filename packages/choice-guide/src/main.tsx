import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChoiceGuideProps, ChoiceGuide } from './choice-guide'

const config: ChoiceGuideProps = {
  title: 'Title',
  choiceGuide: [
    {
      vraag: "1. Wat vind je belangrijker?",
      optie1: "Dat er ruimte komt voor plantenbakken in de straat.",
      optie1Beschrijving: "Het kiezen voor plantenbakken gaat ten koste van extra ruimte voor fietsparkeren of zitgelegenheid.",
      optie2: "Dat ik mijn fiets zo dicht mogelijk bij de voordeur kan parkeren.",
      optie2Beschrijving: "Als er meer fietsparkeervoorzieningen in de straat geplaatst worden, is er minder ruimte voor plantenbakken of zitgelegenheid."
    },
    {
      vraag : "2. Wat vind je belangrijker?",
      optie1 : "Ruimte voor bankjes in de straat.",
      optie1Beschrijving : "Het kiezen voor bankjes in de straat gaat ten koste van extra ruimte voor plantenbakken.",
      optie2 : "Ruimte voor plantenbakken in de straat.",
      optie2Beschrijving : "Het kiezen voor plantenbakken op de kade gaat ten koste van extra ruimte voor bankjes."
    },
    {
      vraag: "3. Wat vind je belangrijker?",
      optie1: "Dat er veel ruimte is om mijn fiets in de straat te kunnen parkeren.",
      optie1Beschrijving: "Als er meer fietsparkeervoorzieningen in de straat geplaatst worden, is minder ruimte voor zitgelegenheid in de vorm van bankjes.",
      optie2: "Dat er genoeg bankjes zijn in de straat.",
      optie2Beschrijving: "Het kiezen voor (ruimte voor) bankjes op de kade gaat ten koste van extra ruimte voor plantenbakken."
    }
  ],
}


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChoiceGuide {...config}/>
  </React.StrictMode>,
)
