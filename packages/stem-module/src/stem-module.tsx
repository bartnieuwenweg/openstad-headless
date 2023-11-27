import { useState } from 'react';

import React from 'react';
import ResourceOverview from '../../resource-overview/src/resource-overview';
import { BaseProps } from '../../types/base-props';
import {
  GhostButton,
  Image,
  SecondaryButton,
  Spacer,
  Stepper,
} from '@openstad-headless/ui/src';
import './stem-module.css';
import { PlainButton } from '@openstad-headless/ui/src/button';

export function StemModule(
  props: BaseProps & {
    site: string;
  }
) {
  const queryparams = window.location.search;
  let searchParams = new URLSearchParams(queryparams);
  const [resource, setResource] = useState<any>();
  const [currentStep, setCurrentStep] = useState<number>(
    searchParams.has('confirmed') ? 3 : 0
  );

  return (
    <>
      <div className="osc">
        <Stepper
          steps={['Kies', 'Verificatie', 'Bevestig']}
          currentStep={currentStep}
          className="stem-module-stepper"
        />

        {currentStep === 0 ? (
          <div>
            <ResourceOverview
              className="stem-module-resource-container"
              renderHeader={() => (
                <>
                  <p className="stem-module-resource-container-intro">
                    Kies uit onderstaand overzicht jouw favoriete ontwerp voor het
                    kunstwerk voor de Aletta Jacobsbuurt, en vul in de volgende
                    stap je gegevens in.
                  </p>
                  <Spacer size={2} />
                  <h5>Kies een ontwerp</h5>
                  <Spacer size={1} />
                </>
              )}
              renderItem={(resource) => (
                <>
                  <Image
                    src={resource.images[0]}
                    imageFooter={
                      <>
                        <PlainButton>Lees meer</PlainButton>
                        <SecondaryButton onClick={() => setResource(resource)}>
                          Stem
                        </SecondaryButton>
                      </>
                    }
                  />
                </>
              )}
              {...props}
              allowFiltering={false}
            />
            <div className="stem-module-resource-footer">
              <SecondaryButton
                disabled={!resource}
                onClick={() => setCurrentStep(currentStep + 1)}>
                Volgende
              </SecondaryButton>
            </div> 
          </div>
        ) : null}

        {currentStep === 1 && resource ? (
          <>
            <section className="stem-module-resource-container">
              <p>
                Via onderstaande knop vul je je emailadres in. Ter controle krijg
                je een link toegestuurd om je e-mailadres te bevestigen. Als dat
                lukt kom je terug op deze pagina om je stem definitief in te
                sturen.
              </p>
              <Spacer size={1} />
              <SecondaryButton>Vul je stemcode in</SecondaryButton>
              <Spacer size={2} />
              <h5>Uw stem.</h5>
              <Spacer size={1} />
              <div className="osc-image-resizer">
                <Image src={resource.images[0]} />
              </div>
            </section>
            <div className="stem-module-resource-footer">
              <PlainButton onClick={() => setCurrentStep(currentStep - 1)}>
                Vorige
              </PlainButton>
              <SecondaryButton 
              className="stem-module-send-button"
              onClick={() => setCurrentStep(currentStep + 1)}>
                Verstuur
              </SecondaryButton>
            </div>
          </>
        ) : null}

        {currentStep === 2 ? (
          <section className="stem-module-resource-container">
            <h5>Mail is verstuurd</h5>
            <p>Kijk in je mailbox</p>
          </section>
        ) : null}

        {currentStep >= 3 ? (
          <>
            <section className="stem-module-resource-container">
              <div
                className={'confirm-icon'}>
                <p>✓</p>
              </div>
              <Spacer size={1} />
              <h5>Gelukt, je stem is opgeslagen!</h5>
              <p>
                Bedankt voor het stemmen! Hou deze site in de gaten voor de
                uitslag.
              </p>
              <Spacer size={1} />
            </section>
            <div className="stem-module-resource-footer">
            <SecondaryButton
                onClick={() => (window.location.href = props.site)}>
                Klaar
              </SecondaryButton>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
