import { useState } from 'react';

import { BaseProps } from '../../types/base-props';
import {
  Input,
  SecondaryButton,
  Slider,
  Spacer,
  Textarea
} from '@openstad-headless/ui/src';
import './choice-guide.css';
import { PlainButton } from '@openstad-headless/ui/src/button';

export function ChoiceGuide(
  props: BaseProps & {
    site: string;
  }
) {
  const queryparams = window.location.search;
  let searchParams = new URLSearchParams(queryparams);
  const [currentStep, setCurrentStep] = useState<number>(
    searchParams.has('confirmed') ? 3 : 0
  );

  let choiceGuide = [
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
  ]

  return (
    <>
      <div className="osc">
        {currentStep === 0 ? (
          <div>
            <>
              <h5>Wat is belangrijk voor de herinrichting van jouw straat?</h5>
              <p>
                Bij de herinrichting van de Schoolstraat is er niet genoeg ruimte om
                alles in te passen. We willen graag jouw voorkeuren weten om een beter
                ontwerp te kunnen maken.
              </p>
              <Spacer size={2}/>
            </>
            <div>
              {choiceGuide?.map((choice: any) => (
                <div className="choice-guide-resource-container">
                  <h5>{choice.vraag}</h5>
                  <Spacer size={2}/>
                  <h6>A. {choice.optie1}</h6>
                  <p className="choice-guide-text">{choice.optie1Beschrijving}</p>
                  <h6>B. {choice.optie2}</h6>
                  <p className="choice-guide-text">{choice.optie2Beschrijving}</p>
                  <Slider/>
                </div>
              ))}
            </div>
            <div className="choice-guide-resource-footer">
              <SecondaryButton
                onClick={() => setCurrentStep(currentStep + 1)}>
                Volgende
              </SecondaryButton>
            </div> 
          </div>
        ) : null}

        {currentStep === 1 ? (
          <>
            <h5>Jouw resultaten</h5>
              <p>
                Bedankt voor het invullen!
              </p>
              <Spacer size={2}/>
            <section className="choice-guide-resource-container">
              <h5>Gegevens</h5>
              <p>
                We willen nog een paar dingen van je weten voordat je jouw voorkeuren
                instuurt. Let op! Je stuurt je antwoorden pas in wanneer je onderaan
                deze pagina op de knop 'Voorkeuren insturen' klikt.
              </p>
              <h6>Postcode</h6>
              <p>Vul hier uw postcode in</p>
              <Input className="choice-guide-input-zipcode"/>
              <Spacer size={1}/>
              <h6>Overige feedback</h6>
              <p>
                Heeft u opmerkingen over de thema's of de vragenlijst? Dan kunt u
                die hier kwijt. (Optioneel!)
              </p>
              <Textarea className='choice-guide-input-feedback'/>
            </section>
            <section className="choice-guide-resource-container">
              <h5>Email-verificatie</h5>
              <p>
                Via onderstaande knop vult u uw emailadres in. Ter controle krijgt
                u een link toegestuurd om uw e-mailadres te bevestigen. Als dat
                lukt komt u terug op deze pagina waar u via de knop 'Voorkeuren
                insturen' definitief uw stem instuurt.
              </p>
              <Spacer size={1} />
              <SecondaryButton>Vul uw emailadres in</SecondaryButton>
            </section>
            <div className="choice-guide-resource-footer">
              <PlainButton onClick={() => setCurrentStep(currentStep - 1)}>
                Vorige
              </PlainButton>
              <SecondaryButton 
              className="choice-guide-send-button"
              onClick={() => setCurrentStep(currentStep + 1)}>
                Voorkeuren insturen
              </SecondaryButton>
            </div>
          </>
        ) : null}

        {currentStep === 2 ? (
          <>
            <section>
              <Spacer size={1} />
              <h5>Het insturen is gelukt!</h5>
              <p>
                Hartelijk bedankt voor uw bijdrage. Om op de hoogte gehouden
                te worden van de uitslag en uitvoering laat je via onderstaande
                knop je emailadres achter.
              </p>
              <Spacer size={1} />
            </section>
            <div className="choice-guide-resource-footer">
              <PlainButton
                onClick={() => (window.location.href = props.site)}>
                Terug naar homepage
              </PlainButton>  
              <SecondaryButton
                className="choice-guide-send-button"
              >
                Hou mij op de hoogte
              </SecondaryButton>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
