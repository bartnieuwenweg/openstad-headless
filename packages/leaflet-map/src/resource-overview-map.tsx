import type { PropsWithChildren } from 'react';
import {loadWidget} from '../../lib/load-widget';
import DataStore from '@openstad-headless/data-store/src';
import parseLocation from './lib/parse-location';

import 'leaflet/dist/leaflet.css';
import './css/base-map.css';

import type { BaseProps } from '../../types/base-props';
import type { ProjectSettingProps } from '../../types/project-setting-props';
import type { MarkerProps } from './types/marker-props';
import type { MarkerIconType } from './types/marker-icon';
import type { MapPropsType } from './types/index';
import type { CategoriesType } from './types/categorize';

import { BaseMap } from './base-map';

export type ResourceOverviewMapWidgetProps =
  BaseProps &
  ProjectSettingProps &
  MapPropsType & {
    marker: MarkerProps,
    markerIcon: MarkerIconType,
  };

export function ResourceOverviewMap({
  categorize = undefined,
  ...props
}: PropsWithChildren<ResourceOverviewMapWidgetProps>) {

  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
    config: { api: props.api },
  });

  const [resources] = datastore.useResources({
    projectId: props.projectId,
  });

  let categorizeByField = categorize?.categorizeByField;;
  let categories: CategoriesType;
  if (categorizeByField) {
    const [tags] = datastore.useTags({
      projectId: props.projectId,
      type: categorizeByField,
    });
    if (tags.length) {
      categories = {};
      tags.map((tag:any) => { // TODO: types/Tag does not exist yet
        categories[ tag.name ] = {
          color: tag.backgroundColor,
          icon: tag.mapIcon,
        }
      });
    }
  }

  let currentMarkers = resources?.map( (resource:any) => { // TODO: types/resource does not exist yet
    let marker:MarkerProps = {
      location: {...resource.location } || undefined,
    }
    parseLocation(marker) // unify location format
    
    if (marker.location && categorizeByField && categories) {
      let tag = resource.tags?.find( (t:any) => t.type == categorizeByField ); // TODO: types/Tag does not exist yet
      if (tag) {
        marker.data = { [categorizeByField]: tag.name };
      }
    }
    return marker;
  });

  return (
    <BaseMap {...props} categorize={{ categories, categorizeByField }} markers={currentMarkers}/>
  );

}

ResourceOverviewMap.loadWidget = loadWidget;

export default ResourceOverviewMap;
