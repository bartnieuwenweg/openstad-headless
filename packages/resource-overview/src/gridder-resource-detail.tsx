import React from 'react';
import { IconButton, Image, SecondaryButton, Spacer } from '@openstad-headless/ui/src';
import './gridder-resource-detail.css';

export const GridderResourceDetail = ({ resource }: { resource: any }) => {
    console.log({resource})
  return (
    <>
     <div className="osc-gridder-resource-detail">
      <section className="osc-gridder-resource-detail-photo">
        <Image
          src={resource.images?.at(0)?.src || ''}
          style={{ aspectRatio: 16 / 9 }}
        />
        <div>
          <button className="osc-load-map-button"></button>
        </div>
      </section>

      <section className="osc-gridder-resource-detail-texts-and-actions-container">
        <div>
          <div className="osc-gridder-resource-detail-budget-theme-bar">
            <h5>&euro; {resource.budget || 0}</h5>
            <div>
              <p className="strong">Thema:</p>
              <p>thema1</p>
              <p className="strong">Gebied:</p>
              <p> buurt 1</p>
            </div>
          </div>

          <div>
            <h4>{resource.title}</h4>
            <p className='strong'>{resource.summary}</p>
            <p>{resource.description}</p>
          </div>
        </div>
        <div className="osc-gridder-resource-detail-actions">
          <SecondaryButton>Verwijder</SecondaryButton>
          <div className="osc-gridder-resource-detail-share-actions">
            <p className='strong'>Deel dit:</p>
            <IconButton className="plain" icon="ri-facebook-fill" />
            <IconButton className="plain" icon="ri-whatsapp-fill" />
            <IconButton className="plain" icon="ri-mail-fill" />
            <IconButton className="plain" icon="ri-twitter-x-fill" />
          </div>
        </div>
      </section>
    </div>

    <Spacer size={2}/>
    </>
   
  );
};
