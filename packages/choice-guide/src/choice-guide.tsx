import React from 'react'
import { useState } from 'react';
import { loadWidget } from '../../lib/load-widget';

import { BaseProps } from '../../types/base-props';
import {
  Input,
  ProgressBar,
  SecondaryButton,
  Spacer,
  Textarea
} from '@openstad-headless/ui/src';
import './choice-guide.css';
import { PlainButton } from '@openstad-headless/ui/src/button';
import { ProjectSettingProps } from '../../types/project-setting-props';
import SliderForm from './parts/slider-form';
import DataStore from '@openstad-headless/data-store/src';
import { SessionStorage } from '@openstad-headless/lib/session-storage';

export type ChoiceGuideWidgetProps = BaseProps &
ChoiceGuideProps &
ProjectSettingProps & {
  resourceId?: string;
}

export type ChoiceGuideProps = {
  choiceGuide?: object[];
  titlePreference?: string;
  titleNoPreference?: string;
  urlStartPage?: string;
  urlResultPage?: string;
}

function ChoiceGuide({
  titlePreference = 'Jouw voorkeur is:',
  titleNoPreference = 'Je hebt nog geen keuze gemaakt.',
  urlStartPage = '',
  urlResultPage = '',
  ...props
}: ChoiceGuideWidgetProps) {
  const urlParams = new URLSearchParams(window.location.search);
  const resourceId = urlParams.get('openstadResourceId') || props.resourceId || 3;
  const [currentStep, setCurrentStep] = useState<number>(0);

  let choiceGuide = props?.choiceGuide || [
    {
      type: "a-to-b",
      vraag: "1. Wat vind je belangrijker?",
      optie1: "Dat er ruimte komt voor plantenbakken in de straat.",
      optie1Beschrijving: "Het kiezen voor plantenbakken gaat ten koste van extra ruimte voor fietsparkeren of zitgelegenheid.",
      optie2: "Dat ik mijn fiets zo dicht mogelijk bij de voordeur kan parkeren.",
      optie2Beschrijving: "Als er meer fietsparkeervoorzieningen in de straat geplaatst worden, is er minder ruimte voor plantenbakken of zitgelegenheid."
    },
    {
      type: "a-to-b",
      vraag : "2. Wat vind je belangrijker?",
      optie1 : "Ruimte voor bankjes in de straat.",
      optie1Beschrijving : "Het kiezen voor bankjes in de straat gaat ten koste van extra ruimte voor plantenbakken.",
      optie2 : "Ruimte voor plantenbakken in de straat.",
      optie2Beschrijving : "Het kiezen voor plantenbakken op de kade gaat ten koste van extra ruimte voor bankjes."
    },
    {
      type: "a-to-b",
      vraag: "3. Wat vind je belangrijker?",
      optie1: "Dat er veel ruimte is om mijn fiets in de straat te kunnen parkeren.",
      optie1Beschrijving: "Als er meer fietsparkeervoorzieningen in de straat geplaatst worden, is minder ruimte voor zitgelegenheid in de vorm van bankjes.",
      optie2: "Dat er genoeg bankjes zijn in de straat.",
      optie2Beschrijving: "Het kiezen voor (ruimte voor) bankjes op de kade gaat ten koste van extra ruimte voor plantenbakken."
    }
  ]

  const datastore: any = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const session = new SessionStorage(props);

  const [currentUser] = datastore.useCurrentUser(props);
  const [resource] = datastore.useResource({
    projectId: props.projectId,
    resourceId,
  });

  const [choiceGuides] = datastore.useChoiceGuides({
    projectId: props.projectId,
    choiceGuideId: 1
  })

  const [choiceResults, setChoiceResults] = React.useState();
  const [bar, setBar] = React.useState(50);
  const [lengthConfirmation, setLengthConfirmation] = React.useState(false);

  function calculateTotal() {
    if (choiceResults != undefined) {
      let total = 0;
      let maximum = choiceResults.length * 100;
      for (let i = 0; i < choiceResults.length; i++) {
        total = total + choiceResults[i].amount
      }
      setBar(Math.floor(total / maximum * 100))
    }
  }
  
  function updateChoiceResults(results: any) {
    if (lengthConfirmation) {
      let data = choiceResults;

      let objIndex = data.findIndex((obj => obj.index == results.index))
      data[objIndex].amount = results.amount;

      setChoiceResults(data)
    } else {
      let data = [];
      for(let i = 0; i < choiceGuide.length; i++) {
        data.push({index: i, amount: 50})
      }
      setChoiceResults(data)
      setLengthConfirmation(true)
    }
    calculateTotal();
  }

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
              {choiceGuide?.map((choice, index) => (
                <SliderForm choice={choice} titlePreference={titlePreference} titleNoPreference={titleNoPreference} onChoiceChanged={(amount) =>{
                  updateChoiceResults({index, amount})
                }} />
              ))}
            </div>
            <div className="choice-guide-resource-container">
              <h5>Hier komen de gewenste waarden.</h5>
              <ProgressBar progress={bar} />
              <p className="progressbar-counter">
                {bar}%
              </p>
              <ProgressBar progress={100 - bar} />
              <p className="progressbar-counter">
                {100 - bar}%
              </p>
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
            <div className="choice-guide-resource-container">
              <h5>Hier zijn de resultaten.</h5>
              <ProgressBar progress={bar} />
              <p className="progressbar-counter">
                {bar}%
              </p>
              <ProgressBar progress={100 - bar} />
              <p className="progressbar-counter">
                {100 - bar}%
              </p>
            </div>
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
                Overnieuw
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
                onClick={() => document.location.href = urlStartPage}>
                Terug naar homepage
              </PlainButton>
              <SecondaryButton
                className="choice-guide-send-button"
                onClick={() => document.location.href = urlResultPage}
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

ChoiceGuide.loadWidget = loadWidget;

export { ChoiceGuide };