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
          <ResourceOverview
            className="stem-module-resource-container"
            renderHeader={() => (
              <>
                <p className="stem-module-resource-container-intro">
                  Kies uit onderstaand overzicht jouw favoriete ontwerp voor het
                  kunstwerk voor de Aletta Jacobsbuurt, en vul in de volgende
                  stap je gegevens in.
                </p>

                <h6>Kies een ontwerp</h6>
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
        ) : null}

        {currentStep === 1 && resource ? (
          <section>
            <p>
              Via onderstaande knop vul je je emailadres in. Ter controle krijg
              je een link toegestuurd om je e-mailadres te bevestigen. Als dat
              lukt kom je terug op deze pagina om je stem definitief in te
              sturen.
            </p>
            <Spacer size={1} />
            <SecondaryButton>Vul je stemcode in</SecondaryButton>
            <Spacer size={1} />
            <h6>Uw stem.</h6>
            <div className="osc-image-resizer">
              <Image src={resource.images[0]} />
            </div>
          </section>
        ) : null}

        {currentStep === 2 ? (
          <section>
            <h6>Mail is verstuurd</h6>
            <p>Kijk in je mailbox</p>
          </section>
        ) : null}

        {currentStep >= 3 ? (
          <section>
            <h6>Gelukt, je stem is opgeslagen!</h6>
            <p>
              Bedankt voor het stemmen! Hou deze site in de gaten voor de
              uitslag.
            </p>
            <Spacer size={1} />
            <SecondaryButton
              onClick={() => (window.location.href = props.site)}>
              Klaar
            </SecondaryButton>
          </section>
        ) : null}

        {currentStep === 2 && resource ? <section></section> : null}
        <Spacer size={1} />
        {currentStep > 0 && currentStep < 2 ? (
          <PlainButton onClick={() => setCurrentStep(currentStep - 1)}>
            Vorige
          </PlainButton>
        ) : null}
        {currentStep < 2 ? (
          <SecondaryButton
            disabled={(currentStep === 0 && !resource) || currentStep > 1}
            onClick={() => setCurrentStep(currentStep + 1)}>
            Volgende
          </SecondaryButton>
        ) : null}
      </div>
    </>
  );
}
