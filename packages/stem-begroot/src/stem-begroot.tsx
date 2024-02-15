import './stem-begroot.css';
import React, { useEffect, useState } from 'react';
import {
  PlainButton,
  SecondaryButton,
  Spacer,
  Stepper,
} from '@openstad-headless/ui/src';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { SessionStorage, hasRole } from '@openstad-headless/lib';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
import { StemBegrootBudgetList } from './step-1/begroot-budget-list/stem-begroot-budget-list';
import { StemBegrootResourceDetailDialog } from './step-1/begroot-detail-dialog/stem-begroot-detail-dialog';

import { StemBegrootResourceList } from './step-1/begroot-resource-list/stem-begroot-resource-list';
import { BudgetUsedList } from './reuseables/used-budget-component';
import { BegrotenSelectedOverview } from './step-2/selected-overview';
import toast, { Toaster } from 'react-hot-toast';

import { Step3Success } from './step-3-success';
import { Step3 } from './step-3';
import { Step4 } from './step-4';

export type StemBegrootWidgetProps = BaseProps &
  ProjectSettingProps & {
    step1: string;
    step2: string;
    step3: string;
    step3success: string;
    voteMessage: string;
    thankMessage: string;
    showNewsletterButton: boolean;
    notEnoughBudgetText?: string;
    displayRanking: boolean;
    displayPriceLabel: boolean;
    showVoteCount: boolean;
    showOriginalResource: boolean;
    originalResourceUrl?: string;
  };

function StemBegroot({
  notEnoughBudgetText = 'Niet genoeg budget',
  ...props
}: StemBegrootWidgetProps) {
  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const [openDetailDialog, setOpenDetailDialog] = React.useState(false);
  const [resourceDetailIndex, setResourceDetailIndex] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentUser] = datastore.useCurrentUser({ ...props });
  const [navAfterLogin, setNavAfterLogin] = useState<boolean>();
  const [shouldReloadSelectedResources, setReloadSelectedResources] =
    useState<boolean>(false);

  const { resources, submitLike } = datastore.useResources({
    projectId: props.projectId,
  });

  // Replace with type when available from datastore
  const [selectedResources, setSelectedResources] = useState<any[]>([]);
  const selectedBudgets: Array<number> = selectedResources.map(
    (r) => r.budget || 0
  );

  const session = new SessionStorage({ projectId: props.projectId });
  const budgetUsed: number = selectedResources.reduce(
    (total, cv) => total + cv.budget,
    0
  );

  const usedBudgetList = (
    <BudgetUsedList
      budgetUsed={budgetUsed}
      maxBudget={props.votes.maxBudget}
      selectedBudgets={selectedBudgets}
    />
  );

  const notifyVoteMessage = (message: string, isError: boolean = false) => {
    if (isError) {
      toast.error(message, { position: 'top-center' });
    }
  };

  const isAllowedToVote =
    props.votes.requiredUserRole &&
    hasRole(currentUser, props.votes.requiredUserRole);

  // Check the pending state and if there are any resources, hint to  update the selected items
  useEffect(() => {
    let pending = session.get('osc-resource-vote-pending');
    if (pending && resources?.records?.length > 0) {
      setReloadSelectedResources(true);
    }
  }, [resources?.records]);

  // if shouldReloadSelectedResources reload the selectedresources from the pendings
  useEffect(() => {
    let pending = session.get('osc-resource-vote-pending');
    if (shouldReloadSelectedResources) {
      const resourcesThatArePending: Array<any> =
        resources?.records?.filter((r: any) => pending && r.id in pending) ||
        [];
      setSelectedResources(resourcesThatArePending);
      setReloadSelectedResources(false);
    }
  }, [shouldReloadSelectedResources]);

  // Force the logged in user to skip step 2: first time entering 'stemcode'
  useEffect(() => {
    if (selectedResources.length === 0) {
      setNavAfterLogin(true);
      return setCurrentStep(0);
    }
    if (
      (isAllowedToVote && currentStep === 2 && !navAfterLogin) ||
      (isAllowedToVote && navAfterLogin && currentStep === 2) ||
      (isAllowedToVote && !navAfterLogin)
    ) {
      setCurrentStep(3);
    }
  }, [currentUser, currentStep, selectedResources]);

  function prepareForVote(e: React.MouseEvent<HTMLElement, MouseEvent> | null) {
    if (e) e.stopPropagation();
    const resourcesToVoteFor: { [key: string]: any } = {};
    (selectedResources.length ? selectedResources : []).forEach(
      (resource: any) => {
        resourcesToVoteFor[resource.id] = 'yes';
      }
    );
    session.set('osc-resource-vote-pending', resourcesToVoteFor);
  }

  async function doVote(resources: Array<any>) {
    if (!props.votes.isActive) {
      throw new Error('Stemmen is niet actief!');
    }

    if (resources.length > 0) {
      const recordsToLike = resources.map(
        (r: { id: string; opinion: string }) => ({
          resourceId: r.id,
          opinion: 'yes',
        })
      );
      return await submitLike(recordsToLike);
    }
  }

  const isInSelected = (resource: { id: number }) =>
    selectedResources.find((r) => r.id === resource.id);

  const getOriginalResourceUrl = (resource: {
    extraData: { originalId: number | string };
  }) => {
    return props.showOriginalResource &&
      props.originalResourceUrl &&
      resource.extraData?.originalId
      ? props.originalResourceUrl.includes('[id]')
        ? props.originalResourceUrl.replace(
            '[id]',
            `${resource.extraData?.originalId}`
          )
        : `${props.originalResourceUrl}/${resource.extraData?.originalId}`
      : null;
  };

  // for now only support budgeting and count
  const resourceSelectable = (resource: { id: number; budget: number }) => {
    if (props.votes.voteType === 'budgeting') {
      return (
        isInSelected(resource) ||
        (!isInSelected(resource) &&
          resource.budget <= props.votes.maxBudget - budgetUsed)
      );
    }
    return (
      isInSelected(resource) ||
      (!isInSelected(resource) &&
        (props.votes.maxResources || 0) > selectedResources.length)
    );
  };

  const createItemBtnString = (resource: { id: number; budget: number }) => {
    if (props.votes.voteType === 'budgeting') {
      return !isInSelected(resource) &&
        !(resource.budget <= props.votes.maxBudget - budgetUsed)
        ? notEnoughBudgetText
        : isInSelected(resource)
        ? 'Verwijder'
        : 'Voeg toe';
    }
    return !isInSelected(resource) &&
      !((props.votes.maxResources || 0) > selectedResources.length)
      ? notEnoughBudgetText
      : isInSelected(resource)
      ? 'Verwijder'
      : 'Voeg toe';
  };

  return (
    <>
      <StemBegrootResourceDetailDialog
        displayPriceLabel={props.displayPriceLabel}
        displayRanking={props.displayRanking}
        showVoteCount={props.showVoteCount}
        showOriginalResource={props.showOriginalResource}
        originalResourceUrl={props.originalResourceUrl}
        resources={resources?.records?.length ? resources.records : []}
        resourceBtnEnabled={resourceSelectable}
        resourceBtnTextHandler={createItemBtnString}
        defineOriginalUrl={getOriginalResourceUrl}
        openDetailDialog={openDetailDialog}
        setOpenDetailDialog={setOpenDetailDialog}
        onPrimaryButtonClick={(resource) => {
          session.remove('osc-resource-vote-pending');

          const resourceInBudgetList = selectedResources.find(
            (r) => r.id === resource.id
          );

          if (resourceInBudgetList) {
            setSelectedResources(
              selectedResources.filter((r) => r.id !== resource.id)
            );
          } else {
            setSelectedResources([...selectedResources, resource]);
          }
        }}
        resourceDetailIndex={resourceDetailIndex}
      />

      <div className="osc">
        <Stepper
          currentStep={currentStep}
          steps={['Kies', 'Overzicht', 'Stemcode', 'Stem']}
        />
        <section className="begroot-step-panel">
          {currentStep === 0 ? (
            <>
              {usedBudgetList}
              <Spacer size={1.5} />
              <StemBegrootBudgetList
                introText={props.step1}
                maxBudget={props.votes.maxBudget}
                allResources={resources?.records || []}
                selectedResources={selectedResources}
                maxNrOfResources={props.votes.maxResources || 0}
                typeIsBudgeting={props.votes.voteType === 'budgeting'}
              />
            </>
          ) : null}

          {currentStep === 1 ? (
            <>
              {usedBudgetList}
              <Spacer size={1.5} />
              <BegrotenSelectedOverview
                introText={props.step2}
                budgetUsed={budgetUsed}
                selectedResources={selectedResources}
                maxBudget={props.votes.maxBudget}
                maxNrOfResources={props.votes.maxResources || 0}
                typeIsBudgeting={props.votes.voteType === 'budgeting'}
              />
            </>
          ) : null}

          {currentStep === 2 ? (
            <Step3
              header={usedBudgetList}
              loginUrl={`${props?.login?.url}`}
              step3={props.step3}
            />
          ) : null}

          {currentStep === 3 ? (
            <Step3Success
              header={usedBudgetList}
              loginUrl={`${props?.login?.url}`}
              step3success={props.step3success}
            />
          ) : null}

          <Spacer size={1} />

          {currentStep === 4 ? (
            <Step4
              header={usedBudgetList}
              loginUrl={`${props?.login?.url}`}
              thankMessage={props.thankMessage}
              voteMessage={props.voteMessage}
              showNewsletterButton={props.showNewsletterButton}
            />
          ) : null}

          <div className="begroot-step-panel-navigation-section">
            {currentStep > 0 && currentStep < 4 ? (
              <PlainButton
                onClick={() => {
                  if (currentStep === 3) {
                    setNavAfterLogin(true);
                    setCurrentStep(currentStep - 2);
                  } else {
                    setCurrentStep(currentStep - 1);
                  }
                }}>
                Vorige
              </PlainButton>
            ) : null}

            {/* Dont show on voting step if you are on step 2 your not logged in*/}
            {currentStep !== 2 ? (
              <SecondaryButton
                onClick={async () => {
                  if (currentStep === 0) {
                    prepareForVote(null);
                  }

                  if (isAllowedToVote) {
                    setNavAfterLogin(true);
                  }

                  if (currentStep === 3) {
                    try {
                      await doVote(selectedResources);
                      setCurrentStep(currentStep + 1);
                    } catch (err: any) {
                      notifyVoteMessage(err.message, true);
                    } finally {
                      session.remove('osc-resource-vote-pending');
                    }
                  } else {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                disabled={selectedResources.length === 0}>
                {currentStep < 3 ? 'Volgende' : null}
                {currentStep === 3 ? 'Stem indienen' : null}
                {currentStep === 4 ? 'Klaar' : null}
              </SecondaryButton>
            ) : null}
          </div>
        </section>
        <Spacer size={4} />

        {currentStep === 0 ? (
          <StemBegrootResourceList
            defineOriginalUrl={getOriginalResourceUrl}
            resourceBtnEnabled={resourceSelectable}
            resourceBtnTextHandler={createItemBtnString}
            resources={resources?.records?.length ? resources?.records : []}
            selectedResources={selectedResources}
            onResourcePlainClicked={(resource, index) => {
              setResourceDetailIndex(index);
              setOpenDetailDialog(true);
            }}
            displayPriceLabel={props.displayPriceLabel}
            displayRanking={props.displayRanking}
            showVoteCount={props.showVoteCount}
            showOriginalResource={props.showOriginalResource}
            originalResourceUrl={props.originalResourceUrl}
            onResourcePrimaryClicked={(resource) => {
              session.remove('osc-resource-vote-pending');

              const resourceIndex = selectedResources.findIndex(
                (r) => r.id === resource.id
              );

              if (resourceIndex === -1) {
                setSelectedResources([...selectedResources, resource]);
              } else {
                const resources = [...selectedResources];
                resources.splice(resourceIndex, 1);
                setSelectedResources(resources);
              }
            }}
          />
        ) : null}
        <Toaster />
      </div>
    </>
  );
}

StemBegroot.loadWidget = loadWidget;
export { StemBegroot };
